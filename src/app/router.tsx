import {
    createBrowserRouter,
    Navigate,
} from "react-router-dom"

import ChatPage from "../pages/Chat/ChatPage"
import LoginPage from "../pages/Login/LoginPage"
import NotFoundPage from "../pages/NotFound/NotFoundPage"
import ChatLayout from "../layouts/ChatLayout.tsx"
import { ProtectedRoute } from "./ProtectedRoute.tsx"

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },

    {
        path: "/login",
        element: <LoginPage />,
    },

    {
        element: (
            <ProtectedRoute>
                <ChatLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "/chat",
                element: <ChatPage />,
            },
        ],
    },

    {
        path: "*",
        element: <NotFoundPage />,
    },
])