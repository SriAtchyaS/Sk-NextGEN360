import { useState, useEffect } from "react";
import { Upload, Users, FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function AssignTask() {
  const [freshers, setFreshers] = useState([]);
  const [selectedFresher, setSelectedFresher] = useState("");
  const [topic, setTopic] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [subtopics, setSubtopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);

  useEffect(() => {
    fetchFreshers();
    fetchAssignedTasks();
  }, []);

  const fetchFreshers = async () => {
    try {
      const { data } = await api.get("/manager/my-freshers");
      setFreshers(data);
    } catch (err) {
      toast.error("Failed to load freshers");
    }
  };

  const fetchAssignedTasks = async () => {
    try {
      const { data } = await api.get("/manager/assigned-tasks");
      setAssignedTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setExcelFile(file);

    // Parse Excel file to show preview of subtopics
    try {
      const formData = new FormData();
      formData.append('file', file);

      // We'll read the file locally to show preview
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          // Simple preview - in production you'd use a library like xlsx
          toast.success(`File "${file.name}" ready to upload`);
        } catch (err) {
          toast.error("Error reading file");
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      toast.error("Error processing file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic || !selectedFresher || !excelFile) {
      toast.error("Please fill all fields and upload an Excel file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('topic', topic);
      formData.append('fresher_id', selectedFresher);
      formData.append('excel_file', excelFile);

      const { data } = await api.post("/manager/assign-task", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success(data.message);
      setSubtopics(data.subtopics || []);

      // Generate mock test for this task
      try {
        await api.post("/mock-test/generate-for-task", {
          task_id: data.task_id
        });
        toast.success("Mock test generated with AI for this task!");
      } catch (err) {
        console.error("Failed to generate mock test:", err);
        toast.error("Task assigned but mock test generation failed");
      }

      // Reset form
      setTopic("");
      setSelectedFresher("");
      setExcelFile(null);
      document.getElementById('excelFileInput').value = '';

      // Refresh tasks list
      fetchAssignedTasks();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to assign task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Assign Task to Fresher</h1>
        <p className="text-gray-600 mt-1">Create a learning task with subtopics and assign it to a fresher</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assignment Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            {/* Topic Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Topic Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., React Hooks, Python Basics, Data Structures"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            {/* Fresher Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Assign to Fresher <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedFresher}
                onChange={(e) => setSelectedFresher(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">Select a fresher...</option>
                {freshers.map((fresher) => (
                  <option key={fresher.id} value={fresher.id}>
                    {fresher.name} ({fresher.email}) - {fresher.department}
                  </option>
                ))}
              </select>
            </div>

            {/* Excel File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Subtopics (Excel File) <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Upload an Excel file with subtopics in the first column. The subtopics will appear below after upload.
              </p>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="excelFileInput"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
                >
                  {excelFile ? (
                    <>
                      <FileSpreadsheet size={20} className="text-green-600" />
                      <span className="text-sm text-gray-700">{excelFile.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="text-gray-400" />
                      <span className="text-sm text-gray-600">Click to upload Excel file</span>
                    </>
                  )}
                </label>
                <input
                  id="excelFileInput"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  required
                />
              </div>
            </div>

            {/* Subtopics Preview */}
            {subtopics.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-green-800 mb-2 flex items-center gap-2">
                  <CheckCircle size={16} />
                  Subtopics Loaded ({subtopics.length})
                </h3>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {subtopics.map((subtopic, idx) => (
                    <div key={idx} className="text-sm text-green-700 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-green-200 flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </span>
                      {subtopic}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Assigning Task...
                </>
              ) : (
                <>
                  <Users size={20} />
                  Assign Task
                </>
              )}
            </button>
          </form>
        </div>

        {/* Assigned Tasks List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Recently Assigned Tasks</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignedTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No tasks assigned yet</p>
              ) : (
                assignedTasks.slice(0, 10).map((task) => (
                  <div
                    key={task.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-800">{task.topic}</h3>
                        <p className="text-xs text-gray-600 mt-1">{task.fresher_name}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            task.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
          <AlertCircle size={16} />
          How it works
        </h3>
        <ul className="text-sm text-blue-700 space-y-1 ml-6 list-disc">
          <li>Enter a topic name manually (e.g., "React Fundamentals")</li>
          <li>Upload an Excel file with subtopics in the first column</li>
          <li>Select a fresher to assign the task to</li>
          <li>AI will automatically generate 20 mock test questions based on the topic and subtopics</li>
          <li>Fresher completes the task at the end of the day and takes the mock test</li>
        </ul>
      </div>
    </div>
  );
}
