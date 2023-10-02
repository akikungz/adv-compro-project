import { Button, Container } from "@mui/material";
import { Result } from "antd";
import { Link } from "react-router-dom";

import Navbar from "../components/navbar";

export default function Error404Page() {
    return (
        <>
            <Navbar />
            <Container>
                <Result 
                    status="404" 
                    title="404" 
                    subTitle="Sorry, the page you visited does not exist."
                    extra={
                        <Link to="/">
                            <Button 
                                variant="contained" 
                                color="error"
                            >
                                Back Home
                            </Button>
                        </Link>
                    }
                />
            </Container>
        </>
    )
}