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