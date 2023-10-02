import { Box, Card, CardBody, CardFooter, CardHeader, Flex, Heading, IconButton, Text } from "@chakra-ui/react";
import { Post, Response } from "../assets/types";
import { Avatar, Button } from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeftOutlined, Delete, Feed, InfoOutlined, Save } from "@mui/icons-material";
import { format } from "date-fns";
import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";
import { Typography } from "antd";
import axios from "axios";
import auth from "../utils/auth";
import config from "../utils/config";

interface PostCardProps {
    post: Post;
    parent?: string | null;
    saved?: boolean;
}

export default function PostCard({ post, parent, saved }: PostCardProps) {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();

    const [deleted, setDeleted] = useState<boolean>(false)
    const [save, setSave] = useState<boolean>(saved || false)

    return deleted ? (<></>) : (
        <Card className="mb-4 pb-4" variant="outline" borderBottom="1px" borderColor="blackAlpha.700">
            <CardHeader>
                { (parent) && (
                    <Button variant="outlined" size="small" startIcon={<Feed />} onClick={() => navigate(`/post/${parent || post.parent}`)} className="hover:cursor-pointer" sx={{ marginBottom: "1em" }} fullWidth>
                        View Parrent post
                    </Button>
                ) }
                <Flex>
                    <Flex flex='1' gap='4' alignItems='center' flexWrap="nowrap">
                        { location.pathname == `/post/${post.id}` && (
                            <IconButton 
                                icon={<ArrowLeftOutlined />} 
                                aria-label="Go Back"
                                onClick={() => navigate("/")}
                                className="hover:cursor-pointer -mr-3 -ml-2"
                            />
                        ) }
                        <Avatar className="hover:cursor-pointer" onClick={() => navigate(`/user/${post.author.id}/posts`)}>{ post.author.username[0].toUpperCase() }</Avatar>
                        <Box>
                            <Heading size='sm' className="hover:cursor-pointer" onClick={() => navigate(`/user/${post.author.id}/posts`)}>{ post.author.username }</Heading>
                            <Text fontSize='sm' color='gray.500'>{ format(new Date(post.created_at), "h:mm a - dd/MM/yyyy") }</Text>
                        </Box>
                    </Flex>
                    <Flex flex='1' justifyContent='flex-end' alignItems='center'>
                        { (post.author.id == auth.user_id) && (
                            <IconButton
                                icon={<Delete />}
                                aria-label="Delete Post"
                                onClick={() => {
                                    axios.delete(`${config.base_url}/posts/${post.id}`, {
                                        headers: { Authorization: `Bearer ${auth.user_token}` }
                                    }).then(res => {
                                        if (res.status == 200) {
                                            if (parent) navigate(`/post/${parent}`)
                                                else if (location.pathname == `/post/${post.id}`) navigate("/")
                                                else {
                                                    setDeleted(true)
                                                }
                                        }
                                    }).catch(err => console.log(err))
                                }}
                                className="hover:cursor-pointer"
                            />
                        ) }

                        { (post.parent && !parent) && (
                            <IconButton 
                                icon={<Feed />} 
                                aria-label="More Details"
                                onClick={() => navigate(`/post/${parent || post.parent}`)}
                                className="hover:cursor-pointer"
                            />
                        ) }

                        { id != post.id && (
                            <IconButton 
                                icon={<InfoOutlined />} 
                                aria-label="More Details"
                                onClick={() => navigate(`/post/${post.id}`)}
                                className="hover:cursor-pointer"
                            />
                        ) }
                    </Flex>
                </Flex>
            </CardHeader>
            <CardBody className="my-2">
                <MDEditor.Markdown source={post.content} style={{ whiteSpace: "pre-wrap" }} />
            </CardBody>
            <CardFooter>
                <Flex width="full" alignItems="center" justifyContent="space-between">
                    { saved != undefined && (
                        <Button
                            variant={ save ? "contained" : "outlined" }
                            size="small"
                            onClick={async () => {
                                try {
                                    const { data: res } = await axios.patch<Response<null>>(`${config.base_url}/posts/${post.id}`, {}, {
                                        headers: { Authorization: `Bearer ${auth.user_token}` }
                                    })

                                    if (res.status == 200) setSave(false)
                                        else if (res.status == 201) setSave(true)
                                        else setSave(false)
                                } catch (err) {
                                    console.log(err)
                                }
                            }}
                            className="hover:cursor-pointer"
                        >
                            <Save />
                            { save ? "Saved" : "Save" }
                        </Button>
                    ) }
                    <Typography.Text type="secondary" className="mr-4">{ post.children_count } Comments</Typography.Text>
                </Flex>
            </CardFooter>
        </Card>
    )
}