import { useEffect } from "react";
import auth from "../utils/auth";
import axios from "axios";
import config from "../utils/config";
import { Response } from "../assets/types";
import Navbar from "../components/navbar";
import { Container } from "@mui/material";

export default function SignoutPage() {
    useEffect(() => {
        axios.post<Response<null>>(`${config.base_url}/auth/signout`, {
            token: auth.user_token
        })
            .then(() => {
                auth.delete_user_token()
                auth.delete_user_id()
                auth.delete_user_name()
                console.log("Signed out")
            })
            .then(() => setTimeout(() => window.location.href = "/", 3000))
            .catch(err => console.log(err))
    }, [])

    return (
        <>
            <Navbar />
            <Container maxWidth="md">
                
            </Container>
        </>
    )
}