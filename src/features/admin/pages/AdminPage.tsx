import { useState, useEffect } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { mockHomeContent } from "../data/mockData";
import { Document as DocumentType, HomePageContent, School } from "../types";
import { AdminHeader } from "../components/AdminHeader";
import { AdminTabs } from "../components/AdminTabs";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";
import { AdminUsers } from "../components/users/AdminUsers";
import { AdminOrders } from "../components/orders/AdminOrders";
import { AdminDocuments } from "../components/documents/AdminDocuments";
import { AdminSchools } from "../components/schools/AdminSchools";
import { AdminContent } from "../components/content/AdminContent";
import { adminService } from "../services/adminService";
import { AdminLogs } from "../components/logs/AdminLogs";
import { AdminPricing } from "../components/pricing/AdminPricing";
import { AdminSpaces } from "../components/spaces/AdminSpaces";
import { AdminPrompts } from "../components/prompts/AdminPrompts";
import { AdminStaticPages } from "../components/pages/AdminStaticPages";

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [homeContent, setHomeContent] =
    useState<HomePageContent>(mockHomeContent);
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    // Load real data for dashboard
    const loadDashboardData = async () => {
      try {
        const [usersData, subscriptionsData, schoolsData] = await Promise.all([
          adminService.getAllUsers(),
          adminService.getAllSubscriptions(),
          adminService.getAllSchools(),
        ]);

        setUsers(usersData);
        setOrders(subscriptionsData.subscriptions || []);
        setSchools(Array.isArray(schoolsData) ? schoolsData : []);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      }
    };

    if (activeTab === "dashboard") {
      loadDashboardData();
    }
  }, [activeTab]);

  const loadDocuments = async () => {
    setDocumentsLoading(true);
    try {
      // Load schools first if not already loaded (needed for mapping)
      let schoolsData: School[] = schools;
      if (schools.length === 0) {
        try {
          const loadedSchools = await adminService.getAllSchools();
          schoolsData = Array.isArray(loadedSchools) ? loadedSchools : [];
          setSchools(schoolsData);
        } catch (error) {
          console.error("Failed to load schools:", error);
          schoolsData = [];
        }
      }

      const response = await adminService.getAllDocuments({
        page: 1,
        page_size: 100,
      });

      // Map API response to Document type
      const mappedDocuments: DocumentType[] = response.documents.map(
        (doc: any) => {
          // Find school by name to get schoolId
          const school = schoolsData.find((s) => s.name === doc.school);
          const schoolId = school?.id || "";

          // Format date from ISO string to readable format
          const uploadedAt = doc.created_at
            ? new Date(doc.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "";

          // Convert size from bytes to MB
          const fileSizeMB = doc.size ? doc.size / (1024 * 1024) : 0;

          // Extract file name from document_name or use a default
          const fileName = doc.document_name
            ? `${doc.document_name.replace(/\s+/g, "_")}.pdf`
            : "document.pdf";

          return {
            id: doc.id,
            name: doc.document_name || "Untitled Document",
            fileName: fileName,
            fileSize: fileSizeMB,
            fileType: "application/pdf", // Default to PDF
            schoolId: schoolId,
            schoolName: doc.school || "Unknown School",
            standard: doc.grade || "",
            subject: doc.subject || "",
            uploadedBy: "admin", // Default value
            uploadedAt: uploadedAt,
            indexed: true, // Default to indexed
          };
        }
      );

      setDocuments(mappedDocuments);
    } catch (error) {
      console.error("Failed to load documents:", error);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "documents" || activeTab === "dashboard") {
      loadDocuments();
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <AdminTabs onTabChange={setActiveTab} />

          <TabsContent value="dashboard" className="space-y-6">
            <AdminDashboard
              documents={documents}
              users={users}
              orders={orders}
              schools={schools}
            />
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <AdminUsers />
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <AdminDocuments
              documents={documents}
              schools={schools}
              loading={documentsLoading}
              onRefresh={loadDocuments}
            />
          </TabsContent>

          <TabsContent value="schools" className="space-y-6">
            <AdminSchools />
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <AdminLogs />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <AdminPricing />
          </TabsContent>

          <TabsContent value="prompts" className="space-y-6">
            <AdminPrompts />
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <AdminStaticPages />
          </TabsContent>

          <TabsContent value="spaces" className="space-y-6">
            <AdminSpaces />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <AdminContent
              homeContent={homeContent}
              onContentChange={setHomeContent}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
