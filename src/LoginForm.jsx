import React, { useState } from "react";
import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export default function LoginForm({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNew, setIsNew] = useState(false); // مستخدم جديد أم تسجيل دخول

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let userCredential;
      if (isNew) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      setUser(userCredential.user); // تسجيل المستخدم
    } catch (err) {
      alert("خطأ: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4 text-center">
          {isNew ? "إنشاء حساب جديد" : "تسجيل الدخول"}
        </h2>
        <input
          type="email"
          placeholder="البريد الإلكتروني"
          className="w-full mb-3 px-3 py-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="كلمة المرور"
          className="w-full mb-4 px-3 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isNew ? "إنشاء حساب" : "دخول"}
        </button>
        <p className="text-sm text-center mt-4 cursor-pointer text-blue-500 hover:underline" onClick={() => setIsNew(!isNew)}>
          {isNew ? "هل لديك حساب؟ سجل الدخول" : "مستخدم جديد؟ أنشئ حسابًا"}
        </p>
      </form>
    </div>
  );
}
