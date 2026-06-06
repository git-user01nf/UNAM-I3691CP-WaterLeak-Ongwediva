IREBASE_API_KEY=AIzaSyBpMMTfFugXUuR7qUgO3Ibiep2kQH-KWHM
FIREBASE_AUTH_DOMAIN=civi-fix13.firebaseapp.com
FIREBASE_PROJECT_ID=civi-fix13
FIREBASE_STORAGE_BUCKET=civi-fix13.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=345242762024
FIREBASE_APP_ID=1:345242762024:web:9284f25927732c444d6e1d
CLOUDINARY_CLOUD_NAME=dlbjuvumj
CLOUDINARY_UPLOAD_PRESET=ongwediva_reports
useEffect(() => {
    verifyLocation();
  }, []);

  const verifyLocation = async () => {
    setVerifying(true);
    setError(null);
    
    try {
      const isValid = await isWithinOngwediva();
      if (isValid) {
        setVerified(true);
        setVerifying(false);
        setTimeout(() => {
          navigation.replace('Home');
        }, 2000);
      } else {
        setVerified(false);
        setVerifying(false);
      }
    } catch (err) {
      setError(err.message);
      setVerifying(false);
    }
  };
if (verifying) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.title}>Verifying Location...</Text>
          <Text style={styles.message}>Please wait while we verify your location</Text>
        </View>
      </LinearGradient>
    );
  }

  if (verified) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Text style={styles.iconText}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Location Verified!</Text>
          <Text style={styles.message}>You are within Ongwediva. Redirecting...</Text>
        </View>
      </LinearGradient>
    );
  }
return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      <View style={styles.content}>
        <View style={styles.errorIcon}>
          <Text style={styles.iconText}>📍</Text>
        </View>
        <Text style={styles.errorTitle}>Location Not Verified</Text>
        <Text style={styles.message}>
          You must be within {MAX_DISTANCE_KM}km of Ongwediva to use this app.
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity style={styles.retryButton} onPress={verifyLocation}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );