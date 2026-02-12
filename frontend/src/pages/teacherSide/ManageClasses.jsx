import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { Upload, Loader2, CircleCheck, AlertCircle, X } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { auth, db } from "../../firebase/firebaseConfig";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

// Class Confirmation Modal Component
function ClassConfirmationModal({ isOpen, classInfo, students, onConfirm, onCancel }) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset to first page when students data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [students]);

  if (!isOpen) return null;

  const totalPages = Math.ceil(students.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = students.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleConfirm = async () => {
    setIsConfirming(true);
    await onConfirm();
    setIsConfirming(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
          <h3 className="text-xl font-bold text-gray-800">Confirm Class Information</h3>
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Class Information */}
          <div className="mb-4 bg-blue-50/50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-bold text-base text-blue-900 mb-2 flex items-center gap-2">
              📚 Class Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <p className="text-xs text-blue-700 font-semibold mb-0.5">Class No.</p>
                <p className="text-sm text-gray-800 font-medium">{classInfo.classNo || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-blue-700 font-semibold mb-0.5">Code</p>
                <p className="text-sm text-gray-800 font-medium">{classInfo.code || "N/A"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-blue-700 font-semibold mb-0.5">Description</p>
                <p className="text-sm text-gray-800 font-medium truncate" title={classInfo.description}>
                  {classInfo.description || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="mb-4">
            <h4 className="font-bold text-lg text-gray-800 mb-3">
              👥 Students ({students.length})
            </h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">No</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Student No.</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Gender</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Program</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Year</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentStudents.map((student, index) => (
                      <tr key={startIndex + index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3 text-gray-700">{student.No || startIndex + index + 1}</td>
                        <td className="px-4 py-3 text-gray-700">{student["Student No."]}</td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{student.Name}</td>
                        <td className="px-4 py-3 text-gray-700">{student.Gender}</td>
                        <td className="px-4 py-3 text-gray-700">{student.Program}</td>
                        <td className="px-4 py-3 text-gray-700">{student.Year}</td>
                        <td className="px-4 py-3 text-gray-700 text-xs">{student["Email Address"]}</td>
                      </tr>
                    ))}
                    {currentStudents.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No students found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2">
                <div className="text-sm text-gray-500">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, students.length)} of {students.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {/* First Page */}
                    {currentPage > 3 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${currentPage === 1
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          1
                        </button>
                        {currentPage > 4 && <span className="text-gray-400">...</span>}
                      </>
                    )}

                    {/* Page Numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        // Logic to show a window of pages around current page
                        return page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1);
                      })
                      .map((page, index, array) => {
                        // Add ellipsis if there's a gap
                        const prevPage = array[index - 1];
                        const showEllipsisBefore = prevPage && page - prevPage > 1;

                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsisBefore && <span className="mr-1 text-gray-400">...</span>}
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md text-sm ${currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                              {page}
                            </button>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="px-6 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Confirm & Save"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageClasses() {
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingUploadData, setPendingUploadData] = useState(null);
  const [classCount, setClassCount] = useState(0);
  const [isLimitReached, setIsLimitReached] = useState(false);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  const authRef = useRef(null);
  const MAX_CLASSES = 8;

  // Check class count on component mount
  useEffect(() => {
    checkClassLimit();
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkClassLimit = async () => {
    const user = auth.currentUser;
    if (!user) {
      console.log("❌ No user found when checking class limit");
      return;
    }

    try {
      const q = query(
        collection(db, "classes"),
        where("teacherId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      const count = querySnapshot.size;

      // Log class IDs for debugging
      const classIds = querySnapshot.docs.map(doc => doc.id);
      console.log(`Teacher has ${count}/${MAX_CLASSES} classes`);
      console.log("Class IDs:", classIds);

      // Log class details to identify incomplete classes
      if (count > 0) {
        querySnapshot.docs.forEach(doc => {
          const data = doc.data();
          console.log(`Class ${doc.id}:`, {
            name: data.name,
            code: data.code,
            classNo: data.classNo,
            studentCount: data.studentCount
          });
        });
      }

      setClassCount(count);
      setIsLimitReached(count >= MAX_CLASSES);
    } catch (error) {
      console.error("Error checking class limit:", error);
    }
  };

  const checkStudentExistsByEmail = async (emailAddress) => {
    if (!emailAddress || emailAddress.trim() === "") {
      return null;
    }

    try {
      const q = query(
        collection(db, "users"),
        where("emailAddress", "==", emailAddress.toLowerCase().trim())
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && querySnapshot.docs && querySnapshot.docs.length > 0) {
        const existingDoc = querySnapshot.docs[0];
        const docData = existingDoc.data();

        // Verify document has required data
        if (!docData) {
          console.warn("Empty document data for:", emailAddress);
          return null;
        }

        return {
          id: existingDoc.id,
          name: docData.name || "",
          classIds: docData.classIds || [],
          hasAccount: docData.hasAccount || false,
          authUID: docData.authUID || null
        };
      }

      return null;
    } catch (error) {
      console.error("Error checking student by email:", error);
      return null;
    }
  };

  const normalizeHeaders = (data) => {
    return data.map(row => {
      const normalized = {};
      Object.keys(row).forEach(key => {
        const trimmedKey = key.trim().replace(/\s+/g, ' ');
        const lowerKey = trimmedKey.toLowerCase();

        if (lowerKey === "no" || lowerKey === "no.") {
          normalized["No"] = row[key];
        } else if (lowerKey === "student no." || lowerKey === "student no" || lowerKey === "student number") {
          normalized["Student No."] = row[key];
        } else if (lowerKey === "name") {
          normalized["Name"] = row[key];
        } else if (lowerKey === "gender") {
          normalized["Gender"] = row[key];
        } else if (lowerKey === "program") {
          normalized["Program"] = row[key];
        } else if (lowerKey === "year") {
          normalized["Year"] = row[key];
        } else if (lowerKey === "email address" || lowerKey === "email") {
          normalized["Email Address"] = row[key];
        } else if (lowerKey === "contact no." || lowerKey === "contact no" || lowerKey === "contact number") {
          normalized["Contact No."] = row[key];
        } else {
          normalized[trimmedKey] = row[key];
        }
      });
      return normalized;
    });
  };

  const extractClassInfo = (allData) => {
    let classNo = "";
    let code = "";
    let description = "";

    // Search through the first 15 rows for class information
    for (let i = 0; i < Math.min(15, allData.length); i++) {
      const row = allData[i];
      if (!row || row.length === 0) continue;

      // Convert row to string for searching
      const rowStr = Array.isArray(row) ? row.join('|').toLowerCase() : '';

      // Look for Class No
      if (rowStr.includes('class no')) {
        const classNoIndex = row.findIndex(cell =>
          cell && cell.toString().toLowerCase().includes('class no')
        );
        if (classNoIndex !== -1 && row[classNoIndex + 1]) {
          classNo = row[classNoIndex + 1].toString().trim();
        }
      }

      // Look for Code
      if (rowStr.includes('code:') || (rowStr.includes('code') && !rowStr.includes('postal'))) {
        const codeIndex = row.findIndex(cell =>
          cell && cell.toString().toLowerCase() === 'code:'
        );
        if (codeIndex !== -1 && row[codeIndex + 1]) {
          code = row[codeIndex + 1].toString().trim();
        }
      }

      // Look for Description
      if (rowStr.includes('description')) {
        const descIndex = row.findIndex(cell =>
          cell && cell.toString().toLowerCase().includes('description')
        );
        if (descIndex !== -1 && row[descIndex + 1]) {
          description = row[descIndex + 1].toString().trim();
        }
      }
    }

    console.log("Extracted class info:", { classNo, code, description });
    return { classNo, code, description };
  };

  const checkClassNoExists = async (classNo) => {
    if (!classNo || classNo.trim() === "") {
      return false;
    }

    try {
      const user = auth.currentUser;
      if (!user) return false;

      const q = query(
        collection(db, "classes"),
        where("teacherId", "==", user.uid),
        where("classNo", "==", classNo.trim())
      );

      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking Class No.:", error);
      return false;
    }
  };

  const processStudentData = async (students, headers, file, allData = []) => {
    console.log("Parsed data:", students);
    console.log("Total rows:", students.length);

    const user = auth.currentUser;
    if (!user) {
      alert("❌ Please log in first!");
      return;
    }

    if (isLimitReached) {
      alert(`❌ Class Limit Reached!\n\nYou have reached the maximum limit of ${MAX_CLASSES} classes.\n\nPlease delete an existing class before adding a new one.`);
      return;
    }

    const normalizedStudents = normalizeHeaders(students);

    const requiredHeaders = ["Student No.", "Name"];
    const firstRow = normalizedStudents[0] || {};
    const availableHeaders = Object.keys(firstRow);

    const missingHeaders = requiredHeaders.filter(h => !availableHeaders.includes(h));

    if (missingHeaders.length > 0) {
      alert(`❌ Missing columns: ${missingHeaders.join(", ")}\n\nAvailable columns: ${availableHeaders.join(", ")}\n\nPlease check your file format.`);
      return;
    }

    const validStudents = normalizedStudents.filter(s =>
      s["Student No."] && s["Name"]
    );

    if (validStudents.length === 0) {
      alert("❌ No valid student data found in file");
      return;
    }

    const classInfo = extractClassInfo(allData);

    if (classInfo.classNo && classInfo.classNo.trim() !== "") {
      setUploadProgress("Validating class information...");
      const classNoExists = await checkClassNoExists(classInfo.classNo);
      if (classNoExists) {
        alert(`❌ Duplicate Class No. Detected!\n\nClass No. "${classInfo.classNo}" already exists in your classes.\n\nEach class must have a unique Class No.`);
        setFileName("");
        setUploadProgress("");
        return;
      }
      setUploadProgress("");
    }

    setPendingUploadData({
      validStudents,
      file,
      classInfo
    });
    setShowConfirmationModal(true);
  };

  const confirmAndUpload = async () => {
    setShowConfirmationModal(false);
    setUploading(true);
    setUploadProgress("Starting upload...");

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("❌ Please log in first!");
        return;
      }

      // Double-check class limit before upload
      if (isLimitReached) {
        alert(`❌ Class Limit Reached!\n\nYou have reached the maximum limit of ${MAX_CLASSES} classes.`);
        setUploading(false);
        setUploadProgress("");
        return;
      }

      const { validStudents, file, classInfo } = pendingUploadData;
      const teacherName = user.displayName || user.email?.split('@')[0] || "Teacher";

      setUploadProgress(`Creating class: ${classInfo.description || file.name}`);

      // Save to Firestore with new structure including classNo and code
      const classDoc = await addDoc(collection(db, "classes"), {
        name: classInfo.description || file.name.replace(/\.(csv|xlsx|xls)$/i, ''),
        classNo: classInfo.classNo || "",
        code: classInfo.code || "",
        subject: "",
        studentCount: validStudents.length,
        teacherId: user.uid,
        teacherEmail: user.email,
        teacherName: teacherName,
        uploadedAt: new Date(),
        fileName: file.name
      });

      console.log(`Created class document: ${classDoc.id}`);

      let newStudentCount = 0;
      let addedToExistingCount = 0;
      let errorCount = 0;

      for (let i = 0; i < validStudents.length; i++) {
        try {
          const student = validStudents[i];
          setUploadProgress(`Processing student ${i + 1}/${validStudents.length}`);

          const {
            "No": no,
            "Student No.": studentNo,
            "Name": name,
            "Gender": gender,
            "Program": program,
            "Year": year,
            "Email Address": emailAddress,
            "Contact No.": contactNo
          } = student;

          if (!studentNo || !name) {
            console.error("Missing required fields:", student);
            errorCount++;
            continue;
          }

          const cleanStudentNo = studentNo.toString().trim();
          const cleanEmail = emailAddress?.toString().trim().toLowerCase() || "";

          const existingStudent = await checkStudentExistsByEmail(cleanEmail);

          if (existingStudent) {
            const updatedClassIds = [...new Set([...existingStudent.classIds, classDoc.id])];

            await updateDoc(doc(db, "users", existingStudent.id), {
              classIds: updatedClassIds
            });

            addedToExistingCount++;
            console.log(`✅ Added ${name} to class ${classInfo.description} (already exists)`);
          } else {
            await addDoc(collection(db, "users"), {
              studentNo: cleanStudentNo,
              name: name.toString().trim(),
              gender: gender?.toString().trim() || "",
              program: program?.toString().trim() || "",
              year: year?.toString().trim() || "",
              emailAddress: cleanEmail,
              contactNo: contactNo?.toString().trim() || "",
              classIds: [classDoc.id],
              role: "student",
              hasAccount: false,
              authUID: null,
              createdAt: new Date()
            });

            newStudentCount++;
            console.log(`✅ New student created: ${name}`);
          }
        } catch (studentError) {
          console.error("Error processing student:", validStudents[i], studentError);
          errorCount++;
        }
      }

      const totalCount = newStudentCount + addedToExistingCount;
      setUploadCount(totalCount);

      if (totalCount > 0) {
        let message = `✅ Upload Complete!\n\n`;
        message += `✨ New students: ${newStudentCount}\n`;
        message += `🔗 Added to existing: ${addedToExistingCount}\n`;

        if (errorCount > 0) {
          message += `❌ Errors: ${errorCount}`;
        }

        alert(message);

        // Update class count
        await checkClassLimit();

        // Trigger real-time update
        console.log("📢 Dispatching classesUpdated event...");
        window.dispatchEvent(new Event('classesUpdated'));

        // Navigate to new class
        setTimeout(() => {
          navigate(`/teacher/class/${classDoc.id}`);
        }, 500);
      } else {
        throw new Error("No students were uploaded successfully");
      }

      setFileName("");
      setUploadProgress("");
      setPendingUploadData(null);

      // Trigger sidebar refresh
      window.dispatchEvent(new Event('classesUpdated'));
    } catch (error) {
      console.error("Error saving to Firestore:", error);
      setErrorMessage(error.message);
      alert("❌ Failed to upload data: " + error.message);
    } finally {
      setUploading(false);
      setUploadProgress("");
    }
  };

  const cancelConfirmation = () => {
    setShowConfirmationModal(false);
    setPendingUploadData(null);
    setFileName("");
  };

  const handleFileUpload = (e) => {
    if (isLimitReached) {
      alert(`❌ Class Limit Reached!\n\nYou have reached the maximum limit of ${MAX_CLASSES} classes.\n\nPlease delete an existing class before adding a new one.`);
      e.target.value = "";
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMessage("");
    setUploadCount(0);

    const fileExtension = file.name.split('.').pop().toLowerCase();

    if (fileExtension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
        transformHeader: (header) => header.trim(),
        complete: async function (results) {
          await processStudentData(results.data, results.meta.fields || [], file, []);
          e.target.value = "";
        },
        error: function (error) {
          console.error("CSV parsing error:", error);
          setErrorMessage("Failed to parse CSV file: " + error.message);
          alert("❌ Failed to parse CSV file. Please check the file format.");
        }
      });
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          const allData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            raw: false,
            defval: ""
          });

          console.log("First 15 rows:", allData.slice(0, 15));

          let headerRowIndex = -1;
          for (let i = 0; i < allData.length; i++) {
            const row = allData[i];
            const rowStr = row.join('|').toLowerCase();
            if (rowStr.includes('student no') || (rowStr.includes('no') && rowStr.includes('name'))) {
              headerRowIndex = i;
              console.log("Found header row at index:", i, "Row:", row);
              break;
            }
          }

          if (headerRowIndex === -1) {
            throw new Error("Could not find header row with 'Student No.' and 'Name' columns");
          }

          const range = XLSX.utils.decode_range(worksheet['!ref']);
          range.s.r = headerRowIndex;
          const newRange = XLSX.utils.encode_range(range);

          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            defval: "",
            range: newRange
          });

          console.log("Parsed data from header row:", jsonData.slice(0, 3));

          const headers = Object.keys(jsonData[0] || {});

          await processStudentData(jsonData, headers, file, allData);
          e.target.value = "";
        } catch (error) {
          console.error("XLSX parsing error:", error);
          setErrorMessage("Failed to parse Excel file: " + error.message);
          alert("❌ Failed to parse Excel file. Please check the file format.");
        }
      };

      reader.onerror = (error) => {
        console.error("File reading error:", error);
        setErrorMessage("Failed to read file");
        alert("❌ Failed to read file");
      };

      reader.readAsArrayBuffer(file);
    } else {
      setErrorMessage("Unsupported file format. Please upload CSV or XLSX files only.");
      alert("❌ Unsupported file format. Please upload CSV or XLSX files only.");
      e.target.value = "";
    }
  };

  return (
    <div className="px-2 py-6 md:p-8 font-Outfit animate-fadeIn">
      <div className="flex flex-col mb-6">
        <h2 className="text-2xl font-bold text-title flex items-center gap-2">
          Add New Class
        </h2>
        <p className="text-md font-light text-subtext">
          Upload a classlist to create a new class ({classCount}/{MAX_CLASSES} classes)
        </p>
      </div>

      {/* Class Limit Warning */}
      {isLimitReached && (
        <div className="mb-6 p-4 bg-orange-50 border-2 border-orange-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-orange-800 font-semibold">Class Limit Reached</p>
            <p className="text-orange-700 text-sm mt-1">
              You have reached the maximum limit of {MAX_CLASSES} classes. Please delete an existing class before adding a new one.
            </p>
          </div>
        </div>
      )}

      {/* Near Limit Warning */}
      {!isLimitReached && classCount >= MAX_CLASSES - 2 && (
        <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-yellow-800 font-semibold">Approaching Class Limit</p>
            <p className="text-yellow-700 text-sm mt-1">
              You have {classCount} out of {MAX_CLASSES} classes. You can add {MAX_CLASSES - classCount} more class{MAX_CLASSES - classCount !== 1 ? 'es' : ''}.
            </p>
          </div>
        </div>
      )}

      <div className={`border-2 border-dashed rounded-3xl p-10 ${isLimitReached ? 'border-gray-200 bg-gray-50 opacity-60' : 'border-gray-300'}`}>
        <div className="text-center">
          <Upload className={`mx-auto w-10 h-10 mb-3 ${isLimitReached ? 'text-gray-300' : 'text-gray-400'}`} />
          <p className={`mb-3 ${isLimitReached ? 'text-gray-400' : 'text-subtext'}`}>
            {isLimitReached ? 'Class limit reached - Delete a class to add new ones' : 'Upload your classlist (.csv or .xlsx)'}
          </p>
          <p className={`text-sm mb-3 ${isLimitReached ? 'text-gray-400' : 'text-subtext'}`}>
            Required columns: No, Student No., Name, Gender, Program, Year, Email Address, Contact No.
          </p>

          <input
            id="file-upload"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
            disabled={uploading || isLimitReached}
          />

          <label
            htmlFor="file-upload"
            className={`inline-block px-6 py-3 font-semibold rounded-lg transition ${uploading || isLimitReached
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white cursor-pointer active:scale-95 hover:scale-105 transition duration-200 hover:bg-blue-700'
              }`}
          >
            {uploading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : isLimitReached ? (
              "Limit Reached"
            ) : (
              "Choose File"
            )}
          </label>

          {fileName && !uploading && !showConfirmationModal && (
            <p className="text-sm text-subtext italic mt-3">Selected: {fileName}</p>
          )}

          {uploadProgress && uploading && (
            <p className="text-sm text-blue-500 font-medium mt-3">
              {uploadProgress}
            </p>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 font-semibold text-center">
              ❌ {errorMessage}
            </p>
          </div>
        )}

        {uploadCount > 0 && !uploading && !errorMessage && (
          <div className="flex items-center justify-center mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="flex flex-row gap-2 text-base items-center text-blue-500 font-semibold text-center">
              <CircleCheck className="w-4 h-4 text-blue-500" /> Successfully processed {uploadCount} student(s)!
            </p>
          </div>
        )}
      </div>

      {mounted && createPortal(
        <ClassConfirmationModal
          isOpen={showConfirmationModal}
          classInfo={pendingUploadData?.classInfo || {}}
          students={pendingUploadData?.validStudents || []}
          onConfirm={confirmAndUpload}
          onCancel={cancelConfirmation}
        />,
        document.body
      )}
    </div>
  );
}