// App.js
import React, { useEffect, useState } from "react";
import LoginForm from "./LoginForm";
// ---------------- firebase
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  addDoc,
} from "firebase/firestore";
import { doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase"; // تأكد أن auth مصدّر من firebase.js

// ------------------ App ------------------ //
function App() {
  // ----------- Stats -------------//
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [user, setUser] = useState(null);

  const tasksRef = collection(db, "tasks");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser); // ✅ المستخدم لا يزال مسجلاً
      } else {
        setUser(null); // ❌ لم يقم بتسجيل الدخول
      }
    });

    return () => unsubscribe(); // نظف الاشتراك عند الخروج
  }, []);

  useEffect(() => {
    if (!user) return;
    // رابط مباشر إلى مجموعة المهام
    const q = query(collection(db, "tasks"), where("user", "==", user.uid));

    // الاشتراك في تحديثات البيانات اللحظية
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTasks(tasksData);
    });

    // تنظيف الاشتراك عند الخروج
    return () => unsubscribe();
  }, [user]);

  //------------------- add Task -----------//
  const handleAddTask = async () => {
    if (newTask.trim() === "") return;

    await addDoc(tasksRef, {
      title: newTask.trim(),
      done: false,
      createdAt: new Date().toISOString(),
      user: user.uid, // 👈 نحدد المستخدم
    });

    setNewTask(""); // تفريغ الحقل بعد الإضافة
  };

  // -------------------- toggle Task Done
  const toggleTaskDone = async (taskId, currentStatus) => {
    const taskRef = doc(db, "tasks", taskId);

    await updateDoc(taskRef, {
      done: !currentStatus,
      completedAt: !currentStatus ? new Date().toISOString() : null,
    });
  };

  // ---------------- Edit Task
  const handleEdit = async (taskId) => {
    const taskRef = doc(db, "tasks", taskId);
    await updateDoc(taskRef, {
      title: editingText.trim(),
    });

    setEditingId(null);
    setEditingText("");
  };

  // ---------------------- delete Task
  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "هل أنت متأكد أنك تريد حذف هذه المهمة؟ لا يمكن التراجع عن ذلك."
    );
    if (!confirmed) return;

    const taskRef = doc(db, "tasks", taskId);
    await deleteDoc(taskRef);
  };

  // ------------ Sort Tasks
  const categorizeTasks = () => {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const startOfLastWeek = new Date();
    startOfLastWeek.setDate(today.getDate() - 7);

    const current = tasks.filter((t) => !t.done);
    const completedToday = tasks.filter((t) => {
      if (!t.done || !t.completedAt) return false;
      return new Date(t.completedAt) >= startOfToday;
    });
    const completedLastWeek = tasks.filter((t) => {
      if (!t.done || !t.completedAt) return false;
      const date = new Date(t.completedAt);
      return date >= startOfLastWeek && date < startOfToday;
    });
    const completedOlder = tasks.filter((t) => {
      if (!t.done || !t.completedAt) return false;
      const date = new Date(t.completedAt);
      return date < startOfLastWeek;
    });

    return {
      current,
      completedToday,
      completedLastWeek,
      completedOlder,
    };
  };

  //--------------render Task --------------------------//
  const renderTask = (task) => (
    <li
      key={task.id}
      className="flex justify-between items-center border-b py-3"
    >
      <span
        className={`flex-1 ${task.done ? "line-through text-gray-400" : ""}`}
      >
        {editingId === task.id ? (
          <input
            value={editingText}
            onChange={(e) => setEditingText(e.target.value)}
            className="flex-1 px-2 py-1 border rounded"
          />
        ) : (
          <span
            className={`flex-1 ${
              task.done ? "line-through text-gray-400" : ""
            }`}
          >
            {task.title}
          </span>
        )}
      </span>

      <div className="flex gap-2">
        <button
          onClick={() => toggleTaskDone(task.id, task.done)}
          className={`px-3 py-1 rounded-md text-sm ${
            task.done
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-green-500 text-white hover:bg-green-600"
          }`}
        >
          {task.done ? "↩️ إرجاع" : "✅ تم"}
        </button>

        <button
          onClick={() => deleteTask(task.id)}
          className="px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600"
        >
          🗑️ حذف
        </button>

        {editingId === task.id ? (
          <button
            onClick={() => handleEdit(task.id)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            💾 حفظ
          </button>
        ) : (
          <button
            onClick={() => {
              setEditingId(task.id);
              setEditingText(task.title);
            }}
            className="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
          >
            ✏️ تعديل
          </button>
        )}
      </div>
    </li>
  );

  // ----------------------------------//

  const { current, completedToday, completedLastWeek, completedOlder } =
    categorizeTasks();

  //------------- choose a user ------//
  if (!user) {
    return <LoginForm setUser={setUser} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4">
      <div className="flex justify-between items-center w-xl p-4 bg-gray-100">
        <span className="text-sm text-gray-600 block">
          👋 مرحبًا،{" "}
          <span className="font-medium text-blue-600">{user?.email}</span>
        </span>{" "}
        <button
          onClick={() => signOut(auth)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          تسجيل الخروج
        </button>
      </div>

      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl p-6">
        <div style={{ padding: "20px" }}>
          <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">
            📋 قائمة المهام
          </h1>
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              value={newTask}
              placeholder="أدخل مهمة جديدة..."
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddTask}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              ➕ إضافة
            </button>
          </div>

          <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-2 bg-red-200 border-b pb-1">
            🟢 المهام الحالية
          </h2>
          <ul>{current.map((task) => renderTask(task))}</ul>
          <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-2 bg-green-300 border-b pb-1">
            ✅ المهام المنجزة اليوم
          </h2>

          <ul>{completedToday.map((task) => renderTask(task))}</ul>
          <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-2 bg-amber-100 border-b pb-1">
            📅 المهام المنجزة الأسبوع الماضي
          </h2>
          <ul>{completedLastWeek.map((task) => renderTask(task))}</ul>
          <h2 className="text-lg font-semibold text-gray-700 mt-8 mb-2 bg-amber-300 border-b pb-1">
            🕰️ المهام المنجزة منذ أكثر من أسبوع
          </h2>

          <ul>{completedOlder.map((task) => renderTask(task))}</ul>
        </div>
      </div>
    </div>
  );
}

export default App;
