import { lazy } from "react";

// Lazy load components for code splitting
const HomePage = lazy(() => import("../../features/home/pages/HomePage"));
const ChatPage = lazy(() => import("../../features/chat/pages/ChatPage"));
const CommunityPage = lazy(
  () => import("../../features/community/pages/CommunityPage")
);
const CourseListPage = lazy(
  () => import("../../features/courses/pages/CourseListPage")
);
const CoursePlayerPage = lazy(
  () => import("../../features/courses/pages/CoursePlayerPage")
);
const AdminPage = lazy(() => import("../../features/admin/pages/AdminPage"));
const UpgradePage = lazy(() => import("../../features/auth/pages/UpgradePage"));
const PaymentPage = lazy(() => import("../../features/payment/pages/PaymentPage"));
const PaymentSuccessPage = lazy(() => import("../../features/payment/pages/PaymentSuccessPage"));
const PaymentCancelPage = lazy(() => import("../../features/payment/pages/PaymentCancelPage"));
const ProfilePage = lazy(() => import("../../features/auth/pages/ProfilePage"));
const SettingsPage = lazy(() => import("../../features/auth/pages/SettingsPage"));
const FaqPage = lazy(() => import("../../features/misc/pages/FaqPage"));
const LibraryPage = lazy(() => import("../../features/library/pages/LibraryPage"));
const GoogleCallbackPage = lazy(() => import("../../features/auth/pages/GoogleCallbackPage"));

export interface AppRoute {
  path: string;
  component: React.ComponentType;
  protected?: boolean;
  adminOnly?: boolean;
}

export const routes: AppRoute[] = [
  {
    path: "/",
    component: ChatPage,
  },
  {
    path: "/home",
    component: HomePage,
    protected: true,
  },
  {
    path: "/app",
    component: ChatPage,
  },
  {
    path: "/app/:id",
    component: ChatPage,
  },
  {
    path: "/upgrade",
    component: PaymentPage,
    protected: true,
  },
  {
    path: "/subscription",
    component: PaymentPage,
    protected: true,
  },
  {
    path: "/payment/success",
    component: PaymentSuccessPage,
    protected: true,
  },
  {
    path: "/payment/cancel",
    component: PaymentCancelPage,
    protected: true,
  },
  {
    path: "/profile",
    component: ProfilePage,
    protected: true,
  },
  {
    path: "/settings",
    component: SettingsPage,
    protected: true,
  },
  {
    path: "/library",
    component: LibraryPage,
    protected: true,
  },
  {
    path: "/faq",
    component: FaqPage,
  },
  {
    path: "/prayers",
    component: CommunityPage,
  },
  {
    path: "/prayers/:id",
    component: CommunityPage,
  },
  {
    path: "/praise",
    component: CommunityPage,
  },
  {
    path: "/praise/:id",
    component: CommunityPage,
  },
  {
    path: "/courses",
    component: CourseListPage,
    protected: true,
  },
  {
    path: "/courses/:courseId/player",
    component: CoursePlayerPage,
    protected: true,
  },
  {
    path: "/admin",
    component: AdminPage,
    protected: true,
    adminOnly: true,
  },
  {
    path: "/admin/*",
    component: AdminPage,
    protected: true,
    adminOnly: true,
  },
  {
    path: "/auth/google/callback",
    component: GoogleCallbackPage,
  },
];
