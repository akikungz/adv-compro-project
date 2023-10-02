import Navbar from "../components/navbar";
import auth from "../utils/auth";
import { Avatar, Container } from "@mui/material";
import { Post, PostIndex, Response } from "../assets/types";
import { useCallback, useEffect, useState } from "react";
import config from "../utils/config";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "../components/postCard";
import { Skeleton } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Card, CardHeader, Flex, Heading, Text } from "@chakra-ui/react";
import { format } from "date-fns";

interface User {
    id: string;
    username: string;
    created_at: string;
}

export default function UserPosts() {
    const navigate = useNavigate();
    const { id } = useParams();

    const initPagination: PostIndex["pagination"] = {
        page: 0,
        total_data: 0,
        total_page: 10,
        limit: 10
    }

    const [loading, setLoading] = useState<boolean>(true)
    const [hasMore, setHasMore] = useState<boolean>(true)
    const [posts, setPosts] = useState<Post[]>([])
    const [user, setUser] = useState<User>({} as User)
    const [pagination, setPagination] = useState<PostIndex["pagination"]>(initPagination)

    if (auth.user_token == null) navigate("/signin")

    const fetchPosts = useCallback(async () => {
        try {
            if (pagination.page + 1 > pagination.total_page || !auth.user_token) {
                setHasMore(false)
                return
            }
            
            const { data: req } = await axios.get<Response<PostIndex>>(`${config.base_url}/users/${id}/posts?page=${pagination.page + 1}&limit=${pagination.limit}`, { 
                headers: { Authorization: `Bearer ${auth.user_token}` } 
            })

            if (req.status === 200) {
                if (pagination.page === 0) setPosts(req.data.posts)
                    else setPosts(prev => ([
                        ...prev,
                        ...req.data.posts
                    ]))
                setPagination(req.data.pagination)
                setLoading(false)
            } else if (req.status === 403) {
                auth.no_auth()
            } else if (req.status === 404){
                setHasMore(false)
                navigate("/404")
            } else {
                setHasMore(false)
            }
        } catch (err) {
            setHasMore(false)
        }
    }, [pagination.page, pagination.limit])

    const fetchUser = useCallback(async () => {
        try {
            const { data: req } = await axios.get<Response<User>>(`${config.base_url}/users/${id}`, { 
                headers: { Authorization: `Bearer ${auth.user_token}` } 
            })

            if (req.status === 200) {
                setUser(req.data)
            }
        } catch (err) {
            setHasMore(false)
        }
    }, [id])

    useEffect(() => {
        fetchPosts()
        fetchUser()
    }, [])

    return (
        <>
            <Navbar />
            { (auth.user_token && !loading) ? (
                <Container maxWidth="md" sx={{ marginTop: "2em", paddingX: "4em" }}>
                    <Card variant="outline" borderBottom="4px" borderColor="blackAlpha.700" className="pb-4">
                        <CardHeader>
                            <Flex>
                                <Flex flex='1' gap='4' alignItems='center' flexWrap="nowrap">
                                    <Avatar className="hover:cursor-pointer" onClick={() => navigate(`/${user.id}`)}>{ user.username[0].toUpperCase() }</Avatar>
                                    <Box>
                                        <Heading size='sm' className="hover:cursor-pointer" onClick={() => navigate(`/${user.id}`)}>{ user.username }</Heading>
                                        <Text fontSize='sm' color='gray.500'>Created - { format(new Date(user.created_at), "dd/MM/yyyy") }</Text>
                                    </Box>
                                </Flex>
                                <Text fontSize='sm' color='gray.500'>Posts</Text>
                            </Flex>
                        </CardHeader>
                    </Card>

                    <InfiniteScroll
                        dataLength={posts.length}
                        next={fetchPosts}
                        hasMore={hasMore}
                        loader={
                            <>
                                <Skeleton active paragraph={{ rows: 10 }}  />
                            </>
                        }
                        endMessage={
                            <p style={{ textAlign: 'center' }}>
                                <b>Yay! You have seen it all</b>
                            </p>
                        }
                        className="mb-8 mt-4"
                    >
                        { posts.map((post, i) => (<PostCard post={post} key={i} />)) }
                    </InfiniteScroll>
                </Container>
            ) : (
                <Container maxWidth="md" sx={{ marginTop: "2em", paddingX: "4em" }}>
                    <Skeleton active paragraph={{ rows: 10 }} />
                </Container>
            ) }
        </>
    )
}