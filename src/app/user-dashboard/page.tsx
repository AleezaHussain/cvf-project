import { Activity, CheckCircle2, Clock3, FileText } from "lucide-react";
import { ReportIssueForm } from "@/app/user-form/page";

export default function UserDashboardPage() {
  const stats = [
    { label: "Total Reports", value: 24, icon: FileText, color: "text-blue-600" },
    { label: "Resolved", value: 11, icon: CheckCircle2, color: "text-green-600" },
    { label: "In Progress", value: 8, icon: Activity, color: "text-amber-600" },
    { label: "Pending", value: 5, icon: Clock3, color: "text-gray-600" },
  ];

  const issues = [
    { id: "R-1201", road: "Kashmir Hwy", area: "G-9", type: "Potholes", status: "Resolved" },
    { id: "R-1202", road: "University Rd", area: "H-8", type: "Cracks", status: "In Progress" },
    { id: "R-1203", road: "IJP Rd", area: "I-9", type: "Potholes", status: "Pending" },
  ];

  return (
    <div className="min-h-screen bg-blue-50 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-bold text-blue-700">Report an Issue</h2>
          <p className="text-gray-600 mb-4">Submit details about road conditions in your area.</p>
          <ReportIssueForm />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="bg-white rounded-xl shadow p-4 flex items-center gap-3">
                <s.icon className={`w-5 h-5 ${s.color}`} />
                <div>
                  <div className="text-sm text-gray-600">{s.label}</div>
                  <div className="text-xl font-semibold text-gray-900">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
              <p className="text-sm text-gray-600">Overview of your submitted issues and their status.</p>
            </div>
            <ul className="divide-y">
              {issues.map((item) => (
                <li key={item.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.type} • {item.road}
                    </div>
                    <div className="text-sm text-gray-600">{item.area} • #{item.id}</div>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.status === "Resolved"
                        ? "bg-green-100 text-green-700"
                        : item.status === "In Progress"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
