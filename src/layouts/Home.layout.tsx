import {Outlet} from "react-router-dom";
import {Container} from "../components/container.tsx";
import {Header} from "../components/header.tsx";

export const HomeLayout = () => {
    return (
        <Container>
            <Header/>
            <Outlet/>
        </Container>
    )
}