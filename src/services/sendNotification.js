// This is a helper - you'll need a backend endpoint or Cloud Function
// For now, this shows the structure. You'll need to set up a Cloud Function.

export const sendNotificationToAllUsers = async (title, body, reportId) => {
  // This should be called from a Cloud Function, not directly from the app
  // Firebase Cloud Functions example:
  /*
  exports.sendNewReportNotification = functions.firestore
    .document('reports/{reportId}')
    .onCreate(async (snap, context) => {
      const report = snap.data();
      const usersSnapshot = await db.collection('users').get();
      
      const tokens = [];
      usersSnapshot.forEach(doc => {
        if (doc.data().pushToken) {
          tokens.push(doc.data().pushToken);
        }
      });
      
      const message = {
        notification: {
          title: `New ${report.category} report!`,
          body: `${report.title} - ${report.username}`,
        },
        data: {
          reportId: context.params.reportId,
          screen: 'ReportDetail',
        },
        tokens: tokens,
      };
      
      await admin.messaging().sendEachForMulticast(message);
    });
  */
  console.log('Send notification to all users:', { title, body, reportId });
};