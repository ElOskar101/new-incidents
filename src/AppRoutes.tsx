import { Routes, Route } from "react-router-dom";
import {HomeLayout} from "./layouts/Home.layout.tsx";
import {HomePage} from "./pages/home/home.page.tsx";

export const AppRoutes = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<HomeLayout />}>
                    <Route index element={<HomePage />} />
                </Route>
            </Routes>
        </>
    )
}