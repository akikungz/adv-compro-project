import { Button, Container, Stack, TextField, Typography } from "@mui/material";
import Navbar from "../components/navbar";
import { Form, useNavigate } from "react-router-dom";
import { useState } from "react";
import config from "../utils/config";
import axios from "axios";
import { Response } from "../assets/types";
import { Login } from "@mui/icons-material";
import { Alert } from "antd";
import auth from "../utils/auth";

export default function SigninPage() {
    const navigate = useNavigate();

    if (auth.user_token) navigate("/")

    const [username, setUsername] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const [error, setError] = useState<string[]>([])

    const handleSubmit = async () => {
        await setError([])
        if (!username) await setError(prev => ([...prev, "Username is required"]))
        if (!password) await setError(prev => ([...prev, "Password is required"]))

        if (error.length == 0) {
            try {
                const { data: req } = await axios.post<Response<{
                    token: string;
                    id: string;
                    username: string;
                }>>(`${config.base_url}/auth/signin`, {
                    username,
                    password
                })
                
                if (req.status !== 200) {
                    setError(prev => ([...prev, req.message]))
                } else {
                    await auth.create_user_token(req.data.token)
                    auth.create_user_id(req.data.id)
                    auth.create_user_name(req.data.username)
                    setTimeout(() => window.location.href = "/", 3000)
                }
            } catch (err) {
                console.log(err)
            }
        }
    }

    return (
        <>
            <Navbar />
            <Container
                maxWidth="md" 
                sx={{
                    marginTop: "4em",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Signin
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                    Login to your account
                </Typography>

                <Container maxWidth="sm" sx={{ marginTop: "2em" }}>

                    { error.length > 0 && (
                        <Stack spacing={1} sx={{ marginBottom: "1em" }}>
                            { error.map((err, i) => (
                                <Alert message={err} type="error" key={i} />
                            )) }
                        </Stack>
                    ) }

                    <Form onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField 
                                label="Username" 
                                variant="outlined" 
                                fullWidth 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                            <TextField 
                                label="Password" 
                                variant="outlined" 
                                fullWidth 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <Button 
                                variant="contained" 
                                color="primary" 
                                startIcon={<Login />}
                                onClick={handleSubmit}
                            >
                                Signin
                            </Button>
                        </Stack>
                    </Form>
                </Container>
            </Container>
        </>
    )
}