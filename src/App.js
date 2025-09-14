import React, { useState, useRef, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  setLogLevel,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

setLogLevel('debug');

// Define global variables to be safe in environments where they are not provided
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase services
const app = firebaseConfig ? initializeApp(firebaseConfig) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const storage = app ? getStorage(app) : null;

const initializeFirebaseCanvasAuth = async () => {
  if (!auth) {
    console.error("Firebase Auth is not initialized.");
    return;
  }
  try {
    if (initialAuthToken) {
      await signInWithCustomToken(auth, initialAuthToken);
    } else {
      await signInAnonymously(auth);
    }
    console.log("Firebase authentication successful.");
  } catch (error) {
    console.error("Firebase authentication failed:", error);
  }
};

// UI components (mocked shadcn/ui with Tailwind)
const Card = ({ children, className }) => (
  <div className={`rounded-xl border bg-white text-gray-900 shadow-lg ${className || ""}`}>{children}</div>
);
const CardContent = ({ children }) => <div className="p-6">{children}</div>;
const Button = ({
  children,
  onClick,
  className,
  disabled,
  type = "button",
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background h-10 py-2 px-4 ${className || ""}`}
  >
    {children}
  </button>
);
const Input = ({
  type,
  placeholder,
  value,
  onChange,
  className,
  accept,
  onChangeFile,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange || onChangeFile}
    accept={accept}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
  />
);

// In-file translation data for simplicity and single-file mandate
const countryLanguageMap = {
  'US': 'en', 'GB': 'en', 'FR': 'fr', 'ES': 'es', 'DE': 'de', 'IT': 'it', 'JP': 'ja', 'KR': 'ko',
};

const translations = {
  'en': {
    welcome: "Welcome to Stash or Trash!",
    submit: "Submit",
    stash: "Stash",
    trash: "Trash",
    whatsTheVerdict: "What's the verdict?",
    describeItem: "Describe your item to stash or trash...",
    descriptionRequired: "A description is required.",
    selectRating: "Please select either Stash or Trash.",
    firebaseNotAvailable: "Firebase services not available.",
    submissionSuccessful: "Submission successful!",
    errorSubmitting: "Error submitting item. Please try again.",
    submitting: "Submitting...",
    mySubmissions: "My Submissions",
    youHaveNotSubmitted: "You haven't stashed or trashed anything yet!",
    loading: "Loading...",
    home: "Home",
    profile: "Profile",
    userProfile: "User Profile",
    userDetails: "User Details:",
    userId: "User ID:",
    email: "Email:",
    isAnonymous: "Is Anonymous:",
    loadingItems: "Loading items...",
    noItemsSubmitted: "No items have been submitted yet. Be the first!",
    shareOnLinkedin: "Share on LinkedIn",
    shareOnFacebook: "Share on Facebook",
    allSubmissions: "All Submissions",
    camera: "Camera",
    stopCapture: "Stop Capture",
  },
  'fr': {
    welcome: "Bienvenue sur Stash or Trash !",
    submit: "Soumettre",
    stash: "Stocker",
    trash: "Jeter",
    whatsTheVerdict: "Quel est le verdet ?",
    describeItem: "Décrivez votre objet à stocker ou à jeter...",
    descriptionRequired: "Une description est requise.",
    selectRating: "Veuillez sélectionner Stocker ou Jeter.",
    firebaseNotAvailable: "Services Firebase non disponibles.",
    submissionSuccessful: "Soumission réussie !",
    errorSubmitting: "Erreur lors de la soumission. Veuillez réessayer.",
    submitting: "Envoi en cours...",
    mySubmissions: "Mes soumissions",
    youHaveNotSubmitted: "Vous n'avez encore rien soumis !",
    loading: "Chargement...",
    home: "Accueil",
    profile: "Profil",
    userProfile: "Profil de l'utilisateur",
    userDetails: "Détails de l'utilisateur :",
    userId: "ID utilisateur :",
    email: "Email :",
    isAnonymous: "Est anonyme :",
    loadingItems: "Chargement des éléments...",
    noItemsSubmitted: "Aucun élément n'a encore été soumis. Soyez le premier !",
    shareOnLinkedin: "Partager sur LinkedIn",
    shareOnFacebook: "Partager sur Facebook",
    allSubmissions: "Toutes les soumissions",
    camera: "Caméra",
    stopCapture: "Arrêter la capture",
  },
  'es': {
    welcome: "¡Bienvenido a Stash or Trash!",
    submit: "Enviar",
    stash: "Guardar",
    trash: "Basura",
    whatsTheVerdict: "¿Cuál es el veredicto?",
    describeItem: "Describe tu artículo para guardar o desechar...",
    descriptionRequired: "Se requiere una descripción.",
    selectRating: "Por favor, seleccione Guardar o Basura.",
    firebaseNotAvailable: "Servicios de Firebase no disponibles.",
    submissionSuccessful: "¡Envío exitoso!",
    errorSubmitting: "Error al enviar el artículo. Por favor, inténtelo de nuevo.",
    submitting: "Enviando...",
    mySubmissions: "Mis envíos",
    youHaveNotSubmitted: "¡Todavía no has guardado o desechado nada!",
    loading: "Cargando...",
    home: "Inicio",
    profile: "Perfil",
    userProfile: "Perfil de usuario",
    userDetails: "Detalles del usuario:",
    userId: "ID de usuario:",
    email: "Correo electrónico:",
    isAnonymous: "¿Es anónimo?:",
    loadingItems: "Cargando elementos...",
    noItemsSubmitted: "Aún no se han enviado elementos. ¡Sé el primero!",
    shareOnLinkedin: "Compartir en LinkedIn",
    shareOnFacebook: "Compartir en Facebook",
    allSubmissions: "Todos los envíos",
    camera: "Cámara",
    stopCapture: "Detener la captura",
  },
  'de': {
    welcome: "Willkommen bei Stash or Trash!",
    submit: "Senden",
    stash: "Stash",
    trash: "Müll",
    whatsTheVerdict: "Was ist das Urteil?",
    describeItem: "Beschreiben Sie Ihren Artikel zum Verstauen oder Wegwerfen...",
    descriptionRequired: "Eine Beschreibung ist erforderlich.",
    selectRating: "Bitte wählen Sie Stash oder Müll.",
    firebaseNotAvailable: "Firebase-Dienste nicht verfügbar.",
    submissionSuccessful: "Einreichung erfolgreich!",
    errorSubmitting: "Fehler beim Senden des Artikels. Bitte versuchen Sie es erneut.",
    submitting: "Senden...",
    mySubmissions: "Meine Einreichungen",
    youHaveNotSubmitted: "Sie haben noch nichts eingereicht!",
    loading: "Laden...",
    home: "Startseite",
    profile: "Profil",
    userProfile: "Benutzerprofil",
    userDetails: "Benutzerdetails:",
    userId: "Benutzer-ID:",
    email: "E-Mail:",
    isAnonymous: "Ist anonym:",
    loadingItems: "Laden von Elementen...",
    noItemsSubmitted: "Noch keine Elemente eingereicht. Seien Sie der Erste!",
    shareOnLinkedin: "Auf LinkedIn teilen",
    shareOnFacebook: "Auf Facebook teilen",
    allSubmissions: "Alle Einreichungen",
    camera: "Kamera",
    stopCapture: "Aufnahme stoppen",
  },
  'it': {
    welcome: "Benvenuto in Stash or Trash!",
    submit: "Invia",
    stash: "Stash",
    trash: "Cestino",
    whatsTheVerdict: "Qual è il verdetto?",
    describeItem: "Descrivi il tuo articolo da nascondere o da buttare...",
    descriptionRequired: "È richiesta una descrizione.",
    selectRating: "Seleziona Stash o Cestino.",
    firebaseNotAvailable: "Servizi Firebase non disponibili.",
    submissionSuccessful: "Invio riuscito!",
    errorSubmitting: "Errore durante l'invio. Riprova.",
    submitting: "Invio in corso...",
    mySubmissions: "Le mie invii",
    youHaveNotSubmitted: "Non hai ancora inviato nulla!",
    loading: "Caricamento...",
    home: "Home",
    profile: "Profilo",
    userProfile: "Profilo utente",
    userDetails: "Dettagli utente:",
    userId: "ID utente:",
    email: "Email:",
    isAnonymous: "È anonimo:",
    loadingItems: "Caricamento elementi...",
    noItemsSubmitted: "Ancora nessun elemento inviato. Sii il primo!",
    shareOnLinkedin: "Condividi su LinkedIn",
    shareOnFacebook: "Condividi su Facebook",
    allSubmissions: "Tutti gli invii",
    camera: "Telecamera",
    stopCapture: "Ferma acquisizione",
  },
  'ja': {
    welcome: "スタッシュ・オア・トラッシュへようこそ！",
    submit: "送信",
    stash: "スタッシュ",
    trash: "トラッシュ",
    whatsTheVerdict: "評決は？",
    describeItem: "スタッシュまたはトラッシュするアイテムを説明してください...",
    descriptionRequired: "説明が必要です。",
    selectRating: "スタッシュまたはトラッシュを選択してください。",
    firebaseNotAvailable: "Firebaseサービスは利用できません。",
    submissionSuccessful: "送信成功！",
    errorSubmitting: "アイテムの送信中にエラーが発生しました。もう一度お試しください。",
    submitting: "送信中...",
    mySubmissions: "マイ送信",
    youHaveNotSubmitted: "まだ何も送信していません！",
    loading: "読み込み中...",
    home: "ホーム",
    profile: "プロフィール",
    userProfile: "ユーザープロフィール",
    userDetails: "ユーザー詳細:",
    userId: "ユーザーID:",
    email: "メールアドレス:",
    isAnonymous: "匿名:",
    loadingItems: "アイテムを読み込み中...",
    noItemsSubmitted: "まだアイテムが送信されていません。最初になりましょう！",
    shareOnLinkedin: "LinkedInで共有",
    shareOnFacebook: "Facebookで共有",
    allSubmissions: "全ての送信",
    camera: "カメラ",
    stopCapture: "キャプチャを停止",
  },
  'ko': {
    welcome: "스태시 오어 트래시에 오신 것을 환영합니다!",
    submit: "제출",
    stash: "보관",
    trash: "버리기",
    whatsTheVerdict: "판결은?",
    describeItem: "보관하거나 버릴 아이템을 설명하세요...",
    descriptionRequired: "설명이 필요합니다.",
    selectRating: "보관 또는 버리기를 선택해주세요.",
    firebaseNotAvailable: "Firebase 서비스를 사용할 수 없습니다.",
    submissionSuccessful: "제출 성공!",
    errorSubmitting: "아이템 제출 중 오류가 발생했습니다. 다시 시도해주세요.",
    submitting: "제출 중...",
    mySubmissions: "내 제출",
    youHaveNotSubmitted: "아직 아무것도 제출하지 않았습니다!",
    loading: "로딩 중...",
    home: "홈",
    profile: "프로필",
    userProfile: "사용자 프로필",
    userDetails: "사용자 상세 정보:",
    userId: "사용자 ID:",
    email: "이메일:",
    isAnonymous: "익명:",
    loadingItems: "아이템 로딩 중...",
    noItemsSubmitted: "아직 제출된 아이템이 없습니다. 처음으로 제출해 보세요!",
    shareOnLinkedin: "링크드인에 공유",
    onFacebook: "페이스북에 공유",
    allSubmissions: "모든 제출",
    camera: "카메라",
    stopCapture: "캡처 중지",
  },
};

const SubmissionForm = ({ userId, t }) => {
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setMediaFile(file);
    }
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setFormError("");
  };

  const startCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setIsCapturing(true);

      mediaRecorderRef.current = new window.MediaRecorder(stream);
      mediaRecorderRef.current.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        blob.name = `capture_${Date.now()}.webm`;
        setMediaFile(blob);
        chunksRef.current = [];
        stopCapture();
      };
      mediaRecorderRef.current.start();
    } catch (err) {
      console.error("Error accessing the camera:", err);
      setIsCapturing(false);
    }
  };

  const stopCapture = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsCapturing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) {
      setFormError(t('descriptionRequired'));
      return;
    }
    if (!rating) {
      setFormError(t('selectRating'));
      return;
    }
    if (!db || !storage) {
      setFormError(t('firebaseNotAvailable'));
      return;
    }
    setFormError("");
    setIsUploading(true);
    let mediaUrl = null;

    try {
      if (mediaFile) {
        const fileName = mediaFile.name || `media_${Date.now()}.webm`;
        const storageRef = ref(storage, `stash-or-trash/${userId}/${fileName}`);
        const uploadTask = await uploadBytes(storageRef, mediaFile);
        mediaUrl = await getDownloadURL(uploadTask.ref);
        console.log("Media uploaded successfully:", mediaUrl);
      }
      const submissionCollectionRef = collection(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "submissions"
      );
      await addDoc(submissionCollectionRef, {
        userId: userId,
        description: description,
        rating: rating,
        mediaUrl: mediaUrl,
        timestamp: serverTimestamp(),
      });

      console.log(t('submissionSuccessful'));
      setDescription("");
      setRating(null);
      setMediaFile(null);
    } catch (error) {
      console.error("Error submitting item:", error);
      setFormError(t('errorSubmitting'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-xl">
        <CardContent>
          <h2 className="text-2xl font-bold mb-4">{t('whatsTheVerdict')}</h2>
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <textarea
              className="flex w-full min-h-[100px] rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder={t('describeItem')}
              value={description}
              onChange={handleDescriptionChange}
            />
            {formError && (
              <p className="text-red-500 text-sm mt-1">{formError}</p>
            )}

            <div className="flex justify-between items-center space-x-2">
              <Button
                type="button"
                onClick={() => setRating("Stash")}
                className={`flex-1 ${rating === "Stash"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
              >
                <span role="img" aria-label="stash">
                  💰
                </span>{" "}
                {t('stash')}
              </Button>
              <Button
                type="button"
                onClick={() => setRating("Trash")}
                className={`flex-1 ${rating === "Trash"
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
              >
                <span role="img" aria-label="trash">
                  🚮
                </span>{" "}
                {t('trash')}
              </Button>
            </div>

            <div className="flex flex-col space-y-2">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*,video/*"
                  onChangeFile={handleFileChange}
                  className="flex-grow"
                />
                <Button type="button" onClick={isCapturing ? stopCapture : startCapture}>
                  {isCapturing ? t('stopCapture') : t('camera')}
                </Button>
              </div>
              {isCapturing && (
                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md" />
              )}
              {mediaFile && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected file: {mediaFile.name || "Recorded media"}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isUploading || !rating || !description}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              {isUploading ? t('submitting') : t('submit')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const StashOrTrashList = ({ t, authReady }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !authReady) {
      setLoading(false);
      return;
    }
    const submissionsCollectionRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "submissions"
    );
    const q = query(submissionsCollectionRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => (b.timestamp?.toDate()?.getTime() || 0) - (a.timestamp?.toDate()?.getTime() || 0));
        setItems(allItems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching items:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [authReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center my-8">
        <div className="text-xl font-bold text-gray-800">{t('loadingItems')}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-4 mt-8">
      {items.length === 0 ? (
        <div className="p-4 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600">
            {t('noItemsSubmitted')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${item.rating === "Stash"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                      }`}
                  >
                    {item.rating === "Stash" ? `${t('stash')} 💰` : `${t('trash')} 🚮`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.timestamp?.toDate
                      ? item.timestamp.toDate().toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 break-words">{item.description}</p>
                {item.mediaUrl && (
                  <div className="mb-4">
                    {item.mediaUrl.match(/\.(mp4|webm)$/)
                      ? (
                        <video
                          controls
                          src={item.mediaUrl}
                          className="w-full rounded-lg"
                          onError={(e) =>
                            console.error("Video failed to load:", e)
                          }
                        />
                      )
                      : (
                        <img
                          src={item.mediaUrl}
                          alt="Submitted media"
                          className="w-full h-auto rounded-lg"
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/400x300/e5e7eb/4b5563?text=Image+Failed+to+Load")
                          }
                        />
                      )}
                  </div>
                )}
                <div className="text-sm text-gray-500">
                  <p>{t('userId')}</p>
                  <p className="font-mono break-all">{item.userId}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const UserWall = ({ userId, authReady, t }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !userId || !authReady) {
      setLoading(false);
      return;
    }
    const submissionsCollectionRef = collection(
      db,
      "artifacts",
      appId,
      "public",
      "data",
      "submissions"
    );
    const q = query(
      submissionsCollectionRef,
      where("userId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const allItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).sort((a, b) => (b.timestamp?.toDate()?.getTime() || 0) - (a.timestamp?.toDate()?.getTime() || 0));
        setItems(allItems);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching user's items:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId, authReady]);

  if (loading) {
    return (
      <div className="flex items-center justify-center my-8">
        <div className="text-xl font-bold text-gray-800">
          {t('loading')}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start p-4 mt-8 w-full">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">{t('mySubmissions')}</h3>
      {items.length === 0 ? (
        <div className="p-4 bg-white rounded-lg shadow-md w-full max-w-xl text-center">
          <p className="text-lg text-gray-600">
            {t('youHaveNotSubmitted')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-7xl">
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${item.rating === "Stash"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                      }`}
                  >
                    {item.rating === "Stash" ? `${t('stash')} 💰` : `${t('trash')} 🚮`}
                  </span>
                  <span className="text-sm text-gray-500">
                    {item.timestamp?.toDate
                      ? item.timestamp.toDate().toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <p className="text-gray-700 mb-4 break-words">{item.description}</p>
                {item.mediaUrl && (
                  <div className="mb-4">
                    {item.mediaUrl.match(/\.(mp4|webm)$/)
                      ? (
                        <video
                          controls
                          src={item.mediaUrl}
                          className="w-full rounded-lg"
                          onError={(e) =>
                            console.error("Video failed to load:", e)
                          }
                        />
                      )
                      : (
                        <img
                          src={item.mediaUrl}
                          alt="Submitted media"
                          className="w-full h-auto rounded-lg"
                          onError={(e) =>
                            (e.target.src =
                              "https://placehold.co/400x300/e5e7eb/4b5563?text=Image+Failed+to+Load")
                          }
                        />
                      )}
                  </div>
                )}
                <div className="flex space-x-2 mt-4">
                  <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}&summary=${encodeURIComponent(item.description)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-4 rounded-md bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium"
                  >
                    {t('shareOnLinkedin')}
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                      typeof window !== "undefined" ? window.location.href : ""
                    )}&quote=${encodeURIComponent(item.description)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center py-2 px-4 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium"
                  >
                    {t('shareOnFacebook')}
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const HomePage = ({ user, authReady, t }) => (
  <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4">
    <SubmissionForm userId={user?.uid} t={t} />
    <StashOrTrashList userId={user?.uid} authReady={authReady} t={t} />
  </div>
);

const ProfilePage = ({ user, authReady, t }) => (
  <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 rounded-lg shadow-md">
    <Card className="w-full max-w-xl">
      <CardContent>
        <h2 className="text-4xl font-bold text-gray-800 mb-4">{t('userProfile')}</h2>
        <p className="text-lg text-gray-600 text-center max-w-lg">View and manage your user profile and settings here.</p>
        {user && (
          <div className="mt-6 p-6 bg-white rounded-lg shadow-md w-full max-w-md border-t-4 border-gray-800">
            <h3 className="text-xl font-bold mb-2 text-gray-800">{t('userDetails')}</h3>
            <p className="text-sm text-gray-700">
              <strong>{t('userId')}</strong> <span className="font-mono break-all">{user.uid}</span>
            </p>
            <p className="text-sm text-gray-700">
              <strong>{t('email')}</strong> {user.email || "N/A"}
            </p>
            <p className="text-sm text-gray-700">
              <strong>{t('isAnonymous')}</strong> {user.isAnonymous ? "Yes" : "No"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    {user && <UserWall userId={user.uid} authReady={authReady} t={t} />}
  </div>
);

const App = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState("home");
  const [authReady, setAuthReady] = useState(false);
  const [language, setLanguage] = useState("en");

  const t = (key) => translations[language][key] || key;

  // Language detection useEffect
  useEffect(() => {
    // Only run if a language is not already stored
    const storedLang = localStorage.getItem("appLanguage");
    if (storedLang) {
      setLanguage(storedLang);
    } else {
      const languageFromBrowser = navigator.language;
      const countryCode = languageFromBrowser.split('-')[1]?.toUpperCase();
      const mappedLanguage = countryLanguageMap[countryCode] || 'en';
      setLanguage(mappedLanguage);
      localStorage.setItem("appLanguage", mappedLanguage);
    }
  }, []);

  useEffect(() => {
    let unsubscribe = () => {};
    if (auth) {
      initializeFirebaseCanvasAuth().then(() => {
        unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          setUser(currentUser);
          setAuthReady(true);
        });
      });
    } else {
      setAuthReady(true); // Treat as ready if auth is not available
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl font-bold text-gray-800">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="font-sans">
      <div className="bg-gray-800 text-white py-4 px-6 flex justify-between items-center rounded-b-lg shadow-lg">
        <h1 className="text-xl font-bold">{t('welcome')}</h1>
        <div className="space-x-4">
          <Button
            onClick={() => setCurrentPage("home")}
            className={`${currentPage === "home"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
          >
            {t('home')}
          </Button>
          <Button
            onClick={() => setCurrentPage("profile")}
            className={`${currentPage === "profile"
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "bg-gray-600 hover:bg-gray-700 text-gray-300"
              }`}
          >
            {t('profile')}
          </Button>
        </div>
      </div>
      {currentPage === "home" && <HomePage user={user} authReady={authReady} t={t} />}
      {currentPage === "profile" && <ProfilePage user={user} authReady={authReady} t={t} />}
    </div>
  );
};

export default App;
