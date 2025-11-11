import apiClient from "../../../core/api/axios";
import axios from "axios";

export interface AdminSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  status: string;
  paypalSubscriptionId?: string;
  startDate?: string;
  nextBillingDate?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  location?: string;
  plan: string;
  status: string;
  lastActive: string;
  createdAt: string;
  subscription?: AdminSubscription | null;
}

export interface AdminSubscriptionsResponse {
  success: boolean;
  subscriptions: AdminSubscription[];
}

export interface AdminSubscriptionResponse {
  success: boolean;
  subscription: AdminSubscription | null;
}

export const adminService = {
  /**
   * Get all subscriptions (admin only)
   */
  async getAllSubscriptions(params?: {
    status?: string;
    plan?: string;
  }): Promise<AdminSubscriptionsResponse> {
    const response = await apiClient.get("/payment/admin/subscriptions", {
      params,
    });
    return response.data;
  },

  /**
   * Get subscription by user ID (admin only)
   */
  async getSubscriptionByUserId(
    userId: string
  ): Promise<AdminSubscriptionResponse> {
    const response = await apiClient.get(
      `/payment/admin/subscription/${userId}`
    );
    return response.data;
  },

  /**
   * Get all users (admin only)
   * Only returns students by default
   */
  async getAllUsers(): Promise<AdminUser[]> {
    const response = await apiClient.get("/user", {
      params: {
        page: 1,
        limit: 1000, // Get all users, adjust if needed
        query: JSON.stringify({ role: "student" }), // Only get students
      },
    });
    // API returns { rows: [], total: number, ... }
    return Array.isArray(response.data)
      ? response.data
      : response.data?.rows || [];
  },

  /**
   * Get user by ID (admin only)
   */
  async getUserById(userId: string): Promise<AdminUser> {
    const response = await apiClient.get(`/user/${userId}`);
    return response.data;
  },

  /**
   * Get activity logs for a user (admin only)
   */
  async getUserLogs(
    userId: string,
    params?: {
      limit?: number;
      offset?: number;
      type?: string;
      from?: string;
      to?: string;
    }
  ): Promise<{ success: boolean; logs: any[] }> {
    const response = await apiClient.get(`/admin/users/${userId}/logs`, {
      params,
    });
    return response.data;
  },

  /**
   * Get all activity logs (admin only)
   */
  async getAllLogs(params?: {
    limit?: number;
    offset?: number;
    type?: string;
    from?: string;
    to?: string;
  }): Promise<{ success: boolean; logs: any[] }> {
    const response = await apiClient.get(`/admin/logs`, { params });
    return response.data;
  },
  /**
   * Admin: Cancel a user's subscription
   */
  async cancelUserSubscription(
    userId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post(`/payment/admin/cancel/${userId}`);
    return response.data;
  },

  /**
   * Admin: Refund user's last payment (if supported)
   */
  async refundUserSubscription(
    userId: string
  ): Promise<{ success?: boolean; message: string }> {
    const response = await apiClient.post(`/payment/admin/refund/${userId}`);
    return response.data;
  },
  /**
   * App settings (pricing/limits)
   */
  async getAppSettings(): Promise<{
    success: boolean;
    settings: Record<string, string>;
  }> {
    const response = await apiClient.get("/settings");
    return response.data;
  },
  async updateAppSettings(
    payload: Record<string, string | number>
  ): Promise<{ success: boolean; settings: Record<string, string> }> {
    const response = await apiClient.put("/settings", payload);
    return response.data;
  },
  /**
   * Get all schools (admin only)
   */
  async getAllSchools(): Promise<School[]> {
    const response = await apiClient.get("/school", {
      params: {
        page: 1,
        limit: 1000,
      },
    });
    // API returns { rows: [], total: number, ... }
    return Array.isArray(response.data)
      ? response.data
      : response.data?.rows || [];
  },

  /**
   * Create a new school (admin only)
   */
  async createSchool(data: {
    name: string;
    address?: string;
    country?: string;
    state?: string;
    city?: string;
    schoolBoard?: string;
    languages?: string[];
    category?: "government" | "private";
  }): Promise<School> {
    const response = await apiClient.post("/school", data);
    return response.data;
  },

  /**
   * Update school (admin only)
   */
  async updateSchool(
    id: string,
    data: {
      name?: string;
      address?: string;
      country?: string;
      state?: string;
      city?: string;
      schoolBoard?: string;
      languages?: string[];
      category?: "government" | "private";
      totalStudents?: number;
      totalTeachers?: number;
    }
  ): Promise<School> {
    const response = await apiClient.put(`/school/${id}`, data);
    return response.data;
  },

  /**
   * Delete school (admin only)
   */
  async deleteSchool(id: string): Promise<void> {
    await apiClient.delete(`/school/${id}`);
  },

  /**
   * Prompts management
   */
  async getRolePrompts(): Promise<{ success: boolean; prompts: RolePrompt[] }> {
    const response = await apiClient.get("/prompt");
    return response.data;
  },

  async updateRolePrompts(
    prompts: RolePrompt[]
  ): Promise<{ success: boolean; prompts: RolePrompt[] }> {
    const response = await apiClient.put("/prompt", prompts);
    return response.data;
  },

  /**
   * Static pages
   */
  async getStaticPages(): Promise<{
    success: boolean;
    pages: StaticPageSummary[];
  }> {
    const response = await apiClient.get("/pages");
    return response.data;
  },

  async updateStaticPage(
    id: string,
    payload: { title?: string; content?: string }
  ): Promise<{ success: boolean; page: StaticPageSummary }> {
    const response = await apiClient.put(`/pages/${id}`, payload);
    return response.data;
  },

  /**
   * Get all documents from external API
   */
  async getAllDocuments(params?: {
    page?: number;
    page_size?: number;
  }): Promise<{
    documents: any[];
    pagination: {
      total: number;
      page: number;
      page_size: number;
      total_pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  }> {
    const response = await axios.get("http://66.116.199.129:8000/list", {
      params,
    });
    return response.data;
  },

  /**
   * Upload PDF document to external API
   */
  async uploadDocument(data: {
    file: File;
    document_name: string;
    school_name: string;
    standard: string;
    subject: string;
  }): Promise<{ success: boolean; message?: string; [key: string]: any }> {
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("document_name", data.document_name);
    formData.append("school_name", data.school_name);
    formData.append("standard", data.standard);
    formData.append("subject", data.subject);

    const response = await axios.post(
      "http://66.116.199.129:8000/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete document from external API
   */
  async deleteDocument(documentId: string): Promise<{ success: boolean; message?: string; [key: string]: any }> {
    const response = await axios.delete(
      `http://66.116.199.129:8000/delete/${documentId}`
    );
    return response.data;
  },
};

export interface School {
  id: string;
  name: string;
  address?: string;
  country?: string;
  state?: string;
  city?: string;
  schoolBoard?: string;
  languages?: string[];
  category?: "government" | "private";
  totalStudents: number;
  totalTeachers: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RolePrompt {
  id?: string;
  role: "student" | "teacher" | string;
  content: string;
}

export interface StaticPageSummary {
  id: string;
  slug: string;
  title: string;
  content: string;
}
