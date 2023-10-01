import { ThemeProvider } from '@mui/system'
import { createTheme } from '@mui/material'
import { ChakraProvider } from '@chakra-ui/react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'

import './assets/index.css'

import ErrorPage from './pages/error'
import SigninPage from './pages/signin'
import SignupPage from './pages/signup'
import HomePage from './pages/home'
import SignoutPage from './pages/signout'
import PostPage from './pages/post'
import UserSaved from './pages/userSaved'

export default function App() {
    return (
        <ChakraProvider>
            <ThemeProvider theme={
                createTheme({
                    palette: {
                        mode: "light",
                        primary: {
                            light: "#bc5d4c",
                            dark: "#ac3520",
                            main: "#b94a3f",
                            contrastText: "#fff"
                        },
                        secondary: {
                            light: "#8a8a8a",
                            dark: "#6d6d6d",
                            main: "#7a7a7a",
                            contrastText: "#fff"
                        }
                    }
                })
            }>
                <RouterProvider router={createBrowserRouter([
                    {
                        path: '/',
                        errorElement: <ErrorPage />,
                        element: <HomePage />
                    },
                    {
                        path: '/error',
                        element: <ErrorPage />
                    },
                    {
                        path: '/signin',
                        element: <SigninPage />
                    },
                    {
                        path: '/signup',
                        element: <SignupPage />
                    },
                    {
                        path: '/signout',
                        element: <SignoutPage />
                    },
                    {
                        path: '/post/:id',
                        element: <PostPage />
                    },
                    {
                        path: '/user/:id/saved',
                        element: <UserSaved />
                    }
                ])} />
            </ThemeProvider>
        </ChakraProvider>
    )
}