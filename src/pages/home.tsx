import Navbar from "../components/navbar";
import auth from "../utils/auth";
import { Container } from "@mui/material";
import { Post, PostIndex, Response } from "../assets/types";
import { useCallback, useEffect, useState } from "react";
import config from "../utils/config";
import axios from "axios";
import InfiniteScroll from "react-infinite-scroll-component";
import PostCard from "../components/postCard";
import PostCreate from "../components/postCreate";
import { Skeleton } from "antd";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
    const navigate = useNavigate();

    const initPagination: PostIndex["pagination"] = {
        page: 0,
        total_data: 0,
        total_page: 10,
        limit: 10
    }

    const [hasMore, setHasMore] = useState<boolean>(true)
    const [posts, setPosts] = useState<Post[]>([])
    const [pagination, setPagination] = useState<PostIndex["pagination"]>(initPagination)

    if (auth.user_token == null) navigate("/signin")

    const fetchPosts = useCallback(async () => {
        try {
            if (pagination.page + 1 > pagination.total_page || !auth.user_token) {
                setHasMore(false)
                return
            }

            const { data: req } = await axios.get<Response<PostIndex>>(`${config.base_url}/posts?page=${pagination.page + 1}&limit=${pagination.limit}`, { 
                headers: { Authorization: `Bearer ${auth.user_token}` } 
            })

            if (req.status === 200) {
                if (pagination.page === 0) setPosts(req.data.posts)
                    else setPosts(prev => ([
                        ...prev,
                        ...req.data.posts
                    ]))
                setPagination(req.data.pagination)
            } else {
                auth.no_auth()
            }
        } catch (err) {
            setHasMore(false)
        }
    }, [pagination.page, pagination.limit])

    useEffect(() => {
        fetchPosts()
    }, [])

    return (
        <>
            <Navbar />
            { auth.user_token && (
                <Container maxWidth="md" sx={{ marginTop: "2em", paddingX: "4em" }}>
                    <PostCreate setState={setPosts} state={posts} />

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
                        { posts.map((post, i) => (<PostCard post={post} key={i} saved={post.saved} />)) }
                    </InfiniteScroll>
                </Container>
            ) }
        </>
    )
}