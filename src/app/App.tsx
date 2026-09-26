import { RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"
import { router } from "./router"
import {GreenApiProvider} from "../context/GreenApiContext.tsx";

export default function App() {
    return (
        <GreenApiProvider>
            <RouterProvider router={router} />

            <Toaster
                position="top-right"
                richColors
                closeButton
                duration={3000}
            />
        </GreenApiProvider>
    )
}