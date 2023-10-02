import { Container } from "@mui/material";
import Navbar from "../components/navbar";
import PostCard from "../components/postCard";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Post, Response } from "../assets/types";
import axios from "axios";
import config from "../utils/config";
import auth from "../utils/auth";
import PostCreate from "../components/postCreate";
import { Skeleton } from "antd";

interface ChildPost extends Post {
    parent: string;
    children: Post[]
}

export default function PostPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState<boolean>(true)
    const [post, setPost] = useState<ChildPost>({} as ChildPost)
    const [children, setChildren] = useState<Post[]>([])

    const fetchPost = useCallback(async () => {
        try {
            setLoading(true)
            setPost({} as ChildPost)
            setChildren([])

            const { data: req } = await axios.get<Response<ChildPost | null>>(`${config.base_url}/posts/${id}`, { 
                headers: { Authorization: `Bearer ${auth.user_token}` } 
            })
            
            if (req.status == 200 && req.data){
                setPost(req.data)
                setChildren(req.data.children)
                setLoading(false)
            } else if (req.status === 403) {
                auth.no_auth()
            } else if (req.status === 404){
                navigate("/404")
            }  else {
                navigate("/")
            }
        } catch (err) {
            navigate("/")
        }
    }, [id])

    useEffect(() => {
        fetchPost()
    }, [id])

    return (
        <>
            <Navbar />
            <Container maxWidth="md" sx={{ marginTop: "2em", paddingX: "4em" }}>
                { loading ? (
                    <Skeleton active paragraph={{ rows: 10 }} />
                ) : (
                    <>
                        <PostCard post={post} parent={post.parent} saved={post.saved} />

                        <PostCreate parrent={post.id} setState={setChildren} state={children}  />

                        { children.map((comment, index) => (
                            <PostCard key={index} post={comment} saved={comment.saved} />
                        )) }
                    </>
                ) }
            </Container>
        </>
    )
}