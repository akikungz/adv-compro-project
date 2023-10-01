import { Button, Container, Stack, TextField, Typography } from "@mui/material";
import Navbar from "../components/navbar";
import { LockOpen } from "@mui/icons-material";
import auth from "../utils/auth";
import { Form, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Alert } from "antd";
import axios from "axios";

import config from "../utils/config";
import { Response } from "../assets/types";

export default function SignupPage() {
    const navigate = useNavigate();

    const [username, setUsername] = useState<string>("")
    const [email, setEmail] = useState<string>("")
    const [password, setPassword] = useState<string>("")

    const [error, setError] = useState<string[]>([])

    if (auth.user_token) navigate("/")

    const handleSubmit = async () => {
        setError([])

        if (!username) setError(prev => ([...prev, "Username is required"]))
        if (!email) setError(prev => ([...prev, "Email is required"]))
            else {
                const emailSplit = email.split("@")
                if (emailSplit.length !== 2 && email) setError(prev => ([...prev, "Invalid email"]))
                    else if (emailSplit[1].split(".").length < 2) setError(prev => ([...prev, "Invalid email"]))
            }

        if (!password) setError(prev => ([...prev, "Password is required"]))
            else if (password.length < 8) setError(prev => ([...prev, "Password must be at least 8 characters"]))

        if (error.length == 0) {
            try {
                const { data: req } = await axios.post<Response<string | null>>(`${config.base_url}/auth/signup`, {
                    username,
                    email,
                    password
                })
    
                if (req.status !== 201) {
                    setError(prev => ([...prev, req.message]))
                } else {
                    navigate("/signin")
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
                    Signup
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                    Create your account
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
                                label="Email" 
                                variant="outlined" 
                                fullWidth 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                startIcon={<LockOpen />}
                                onClick={handleSubmit}
                            >
                                Signup
                            </Button>
                        </Stack>
                    </Form>
                </Container>
            </Container>
        </>
    )
}