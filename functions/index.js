const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();

// Send notification when a new report is created
exports.sendNewReportNotification = functions.firestore
    .document('reports/{reportId}')
    .onCreate(async (snap, context) => {
        const report = snap.data();
        const reportId = context.params.reportId;
        
        console.log('New report created:', report.title);
        
        // Get all users who have push tokens
        const usersSnapshot = await db.collection('users').get();
        
        const tokens = [];
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            if (userData.pushToken && userData.pushToken !== '') {
                tokens.push(userData.pushToken);
            }
        });
        
        if (tokens.length === 0) {
            console.log('No users with push tokens found');
            return null;
        }
        
        // Get category icon
        const categoryIcons = {
            'water': '💧',
            'roads': '🛣️',
            'sanitation': '🗑️',
            'safety': '🛡️',
            'environment': '🌿'
        };
        
        const categoryIcon = categoryIcons[report.category] || '📋';
        
        // Create notification message
        const message = {
            notification: {
                title: `${categoryIcon} New ${report.category} report`,
                body: `${report.title} - by ${report.username}`
            },
            data: {
                reportId: reportId,
                screen: 'ReportDetail',
                category: report.category,
                title: report.title
            },
            tokens: tokens
        };
        
        try {
            const response = await admin.messaging().sendEachForMulticast(message);
            console.log('Successfully sent messages:', response);
            
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                        console.error('Failed token:', tokens[idx], resp.error);
                    }
                });
                await removeInvalidTokens(failedTokens);
            }
            
            return response;
        } catch (error) {
            console.error('Error sending notifications:', error);
            return null;
        }
    });

// Send notification when report status is updated
exports.sendStatusUpdateNotification = functions.firestore
    .document('reports/{reportId}')
    .onUpdate(async (change, context) => {
        const beforeData = change.before.data();
        const afterData = change.after.data();
        const reportId = context.params.reportId;
        
        if (beforeData.status === afterData.status) {
            return null;
        }
        
        const ownerId = afterData.userId;
        const ownerDoc = await db.collection('users').doc(ownerId).get();
        const ownerToken = ownerDoc.data()?.pushToken;
        
        if (!ownerToken) {
            console.log('Report owner has no push token');
            return null;
        }
        
        const statusNames = {
            'pending': '🔴 Pending',
            'in_progress': '🟡 In Progress',
            'resolved': '🟢 Resolved'
        };
        
        const message = {
            notification: {
                title: 'Report Status Updated',
                body: `Your report "${afterData.title}" is now ${statusNames[afterData.status]}`
            },
            data: {
                reportId: reportId,
                screen: 'ReportDetail',
                status: afterData.status
            },
            token: ownerToken
        };
        
        try {
            const response = await admin.messaging().send(message);
            console.log('Status update notification sent:', response);
            return response;
        } catch (error) {
            console.error('Error sending status notification:', error);
            return null;
        }
    });

// Send notification when a comment is added
exports.sendCommentNotification = functions.firestore
    .document('reports/{reportId}/comments/{commentId}')
    .onCreate(async (snap, context) => {
        const comment = snap.data();
        const reportId = context.params.reportId;
        
        const reportDoc = await db.collection('reports').doc(reportId).get();
        const report = reportDoc.data();
        
        if (comment.userId === report.userId) {
            return null;
        }
        
        const ownerDoc = await db.collection('users').doc(report.userId).get();
        const ownerToken = ownerDoc.data()?.pushToken;
        
        if (!ownerToken) {
            console.log('Report owner has no push token');
            return null;
        }
        
        const message = {
            notification: {
                title: 'New Comment on Your Report',
                body: `${comment.username} commented: "${comment.comment.substring(0, 100)}"`
            },
            data: {
                reportId: reportId,
                screen: 'ReportDetail',
                commentId: context.params.commentId
            },
            token: ownerToken
        };
        
        try {
            const response = await admin.messaging().send(message);
            console.log('Comment notification sent:', response);
            return response;
        } catch (error) {
            console.error('Error sending comment notification:', error);
            return null;
        }
    });

// Helper function to remove invalid tokens
async function removeInvalidTokens(tokens) {
    for (const token of tokens) {
        const usersSnapshot = await db.collection('users').where('pushToken', '==', token).get();
        usersSnapshot.forEach(async (doc) => {
            await doc.ref.update({ pushToken: null, tokenInvalid: true });
            console.log('Removed invalid token for user:', doc.id);
        });
    }
}

// Update user token
exports.updateUserToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    
    const userId = context.auth.uid;
    const { pushToken } = data;
    
    if (!pushToken) {
        throw new functions.https.HttpsError('invalid-argument', 'Push token required');
    }
    
    await db.collection('users').doc(userId).update({
        pushToken: pushToken,
        tokenUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true };
});

// Send announcement to all users (admin only)
exports.sendAnnouncement = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
    }
    
    const userDoc = await db.collection('users').doc(context.auth.uid).get();
    const isAdmin = userDoc.data()?.isAdmin === true;
    
    if (!isAdmin) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can send announcements');
    }
    
    const { title, body } = data;
    
    if (!title || !body) {
        throw new functions.https.HttpsError('invalid-argument', 'Title and body required');
    }
    
    const usersSnapshot = await db.collection('users').get();
    const tokens = [];
    usersSnapshot.forEach(doc => {
        if (doc.data().pushToken) {
            tokens.push(doc.data().pushToken);
        }
    });
    
    if (tokens.length === 0) {
        return { success: false, message: 'No users with tokens' };
    }
    
    const message = {
        notification: {
            title: `📢 ${title}`,
            body: body
        },
        data: {
            screen: 'Announcements',
            type: 'announcement'
        },
        tokens: tokens
    };
    
    try {
        const response = await admin.messaging().sendEachForMulticast(message);
        return { success: true, successCount: response.successCount, failureCount: response.failureCount };
    } catch (error) {
        console.error('Error sending announcement:', error);
        throw new functions.https.HttpsError('internal', 'Failed to send announcement');
    }
});