import { AppBar, Avatar, Box, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import auth from "../utils/auth";
import { useState } from "react";
import { Lock, LockOpen, Login, Person, Save } from "@mui/icons-material";

export default function Navbar() {
    const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="sticky" color="inherit">
            <Container>
                <Toolbar variant="dense">
                    <Typography variant="h5" fontWeight="bold" color="primary">
                        <Link to="/">Fake-X</Link>
                    </Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Box sx={{ flexGrow: 0 }}>
                        <IconButton onClick={handleOpenUserMenu}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                                { auth.user_name ? auth.user_name[0].toUpperCase() : "?" }
                            </Avatar>
                        </IconButton>
                        <Menu 
                            sx={{ mt: '45px' }}
                            anchorEl={anchorElUser}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorElUser)}
                            onClose={handleCloseUserMenu}
                        >
                            {
                                (auth.user_id && auth.user_name) ? [
                                    <MenuItem onClick={handleCloseUserMenu} key={0}>
                                        <Link to={`/user/${auth.user_id}`}>
                                            <Person />
                                            {auth.user_name}
                                        </Link>
                                    </MenuItem>,
                                    <MenuItem onClick={handleCloseUserMenu} key={1}>
                                        <Link to={`/user/${auth.user_id}/saved`}>
                                            <Save />
                                            Saved Posts
                                        </Link>
                                    </MenuItem>,
                                    <MenuItem onClick={handleCloseUserMenu} key={2}>
                                        <Link to="/signout">
                                            <Lock />
                                            Sign out
                                        </Link>
                                    </MenuItem>
                                ] : [
                                    <MenuItem onClick={handleCloseUserMenu} key={0}>
                                        <Link to="/signin">
                                            <Login />
                                            Sign in
                                        </Link>
                                    </MenuItem>,
                                    <MenuItem onClick={handleCloseUserMenu} key={1}>
                                        <Link to="/signup">
                                            <LockOpen />
                                            Sign up
                                        </Link>
                                    </MenuItem>
                                ]
                            }
                        </Menu>
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    )
}