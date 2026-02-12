import TeacherSidebar from "../../components/TeacherSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../firebase/firebaseConfig";
import { School, NotebookPen, Users } from "lucide-react";

export default function TeacherDashboard({ user, userDoc }) {
  const [sidebarWidth, setSidebarWidth] = useState("288px");
  const location = useLocation();

  const [totalClasses, setTotalClasses] = useState(0);
  const [totalQuizzes, setTotalQuizzes] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  const [loadingClasses, setLoadingClasses] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);

  const teacherId = userDoc?.id || user?.uid;
  useEffect(() => {
    if (!teacherId) {
      setLoadingClasses(false);
      return;
    }

    setLoadingClasses(true);
    const q = query(collection(db, "classes"), where("teacherId", "==", teacherId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTotalClasses(snapshot.size);
        setLoadingClasses(false);
      },
      (error) => {
        console.error("Error fetching classes:", error);
        setLoadingClasses(false);
      }
    );

    return () => unsubscribe();
  }, [teacherId, location.pathname]);

  useEffect(() => {
    if (!teacherId) {
      setLoadingQuizzes(false);
      return;
    }

    setLoadingQuizzes(true);
    const q = query(collection(db, "quizzes"), where("teacherId", "==", teacherId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setTotalQuizzes(snapshot.size);
        setLoadingQuizzes(false);
      },
      (error) => {
        console.error("Error fetching quizzes:", error);
        setLoadingQuizzes(false);
      }
    );

    return () => unsubscribe();
  }, [teacherId, location.pathname]);

  useEffect(() => {
    if (!teacherId) {
      setLoadingStudents(false);
      return;
    }

    setLoadingStudents(true);
    const q = query(collection(db, "classes"), where("teacherId", "==", teacherId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let totalStudentCount = 0;
        snapshot.forEach(doc => {
          totalStudentCount += doc.data().studentCount || 0;
        });
        setTotalStudents(totalStudentCount);
        setLoadingStudents(false);
      },
      (error) => {
        console.error("Error fetching students:", error);
        setLoadingStudents(false);
      }
    );

    return () => unsubscribe();
  }, [teacherId, location.pathname]);

  // 🔹 Sidebar width handling
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const width = getComputedStyle(document.documentElement)
        .getPropertyValue("--sidebar-width")
        .trim();
      if (width) {
        setSidebarWidth(width);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["style"],
    });

    const initialWidth = getComputedStyle(document.documentElement)
      .getPropertyValue("--sidebar-width")
      .trim();
    if (initialWidth) {
      setSidebarWidth(initialWidth);
    }

    return () => observer.disconnect();
  }, []);

  const isMainDashboard =
    location.pathname === "/teacher" || location.pathname === "/teacher/";

  return (
    <div className="flex h-screen bg-background">
      <TeacherSidebar user={user} userDoc={userDoc} />

      <div
        className="flex-1 overflow-y-auto transition-all duration-300 pt-16"
        style={{ marginLeft: window.innerWidth >= 1024 ? sidebarWidth : "0" }}
      >
        <div className="max-w-7xl mx-auto p-6 font-Outfit">
          {isMainDashboard ? (
            <div className="px-2 py-6 md:p-8 animate-fadeIn">
              <h1 className="text-2xl md:text-3xl font-bold text-title">
                Welcome, {userDoc?.firstName || user?.displayName || "Teacher"}! 👋
              </h1>
              <p className="text-md md:text-lg text-subtext mt-1">
                Manage your classes, quizzes, and view student performance analytics
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8 animate-slideIn">

                {/* Classes Card */}
                <div className="group relative bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full opacity-80"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Classes</p>
                      <h2 className="text-4xl font-extrabold text-gray-800 mt-2">
                        {loadingClasses ? (
                          <span className="inline-block w-14 h-10 bg-gray-200 rounded-lg animate-pulse"></span>
                        ) : totalClasses}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">Active classes</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                      <School className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                {/* Quizzes Card */}
                <div className="group relative bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-emerald-50 to-transparent rounded-bl-full opacity-80"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Quizzes</p>
                      <h2 className="text-4xl font-extrabold text-gray-800 mt-2">
                        {loadingQuizzes ? (
                          <span className="inline-block w-14 h-10 bg-gray-200 rounded-lg animate-pulse"></span>
                        ) : totalQuizzes}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">Created quizzes</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                      <NotebookPen className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

                {/* Students Card */}
                <div className="group relative bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-50 to-transparent rounded-bl-full opacity-80"></div>
                  <div className="relative flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total Students</p>
                      <h2 className="text-4xl font-extrabold text-gray-800 mt-2">
                        {loadingStudents ? (
                          <span className="inline-block w-14 h-10 bg-gray-200 rounded-lg animate-pulse"></span>
                        ) : totalStudents}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">Enrolled students</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                      <Users className="h-7 w-7 text-white" />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  );
}