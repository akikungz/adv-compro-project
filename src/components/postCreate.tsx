import { Card, CardBody, CardFooter, CardHeader } from "@chakra-ui/react";
import { Button, Typography } from "@mui/material";
import { useState } from "react";
import config from "../utils/config";
import axios from "axios";
import { Post, Response } from "../assets/types";
import auth from "../utils/auth";
import MDEditor, { commands } from '@uiw/react-md-editor';

interface PostCreateProps {
    setState: (value: Post[]) => void;
    state: Post[];
    parrent?: string;
}

export default function PostCreate ({ setState, state, parrent }: PostCreateProps) {
    const [content, setContent] = useState<string>("")
    const [error, setError] = useState<string[]>([])

    const handleSubmit = async () => {
        try {
            if (!parrent) {
                const { data: req } = await axios.post<Response<{ id: string } | null>>(`${config.base_url}/posts`, { content }, {
                    headers: { Authorization: `Bearer ${auth.user_token}` }
                })
    
                if (req.status !== 201) {
                    setError(prev => ([...prev, req.message]))
                } else {
                    setContent("")
                    axios.get<Response<Post>>(`${config.base_url}/posts/${req.data?.id}`, {
                        headers: { Authorization: `Bearer ${auth.user_token}` }
                    }).then(({ data }) => {
                        setState([data.data, ...state] as Post[])
                    })
                }
            } else {
                const { data: req } = await axios.post<Response<Post | null>>(`${config.base_url}/posts/${parrent}`, { content }, {
                    headers: { Authorization: `Bearer ${auth.user_token}` }
                })
    
                if (req.status !== 201) {
                    setError(prev => ([...prev, req.message]))
                } else {
                    setContent("")
                    axios.get<Response<Post>>(`${config.base_url}/posts/${req.data?.id}`, {
                        headers: { Authorization: `Bearer ${auth.user_token}` }
                    }).then(({ data }) => {
                        setState([data.data, ...state] as Post[])
                    })
                }
            }
        } catch (err) {}
    }

    return (
        <Card className="mb-4">
            <CardHeader>
                <Typography variant="body1" fontWeight="bold" color="primary">
                    { parrent ? "Comment" : "New post"} { error.length > 0 && <span className="text-red-500">- {error[0]}</span> }
                </Typography>
            </CardHeader>
            <CardBody>
                <MDEditor
                    value={content}
                    onChange={e => setContent(e as string)}
                    commands={[
                        commands.bold,
                        commands.italic,
                        commands.strikethrough,
                        commands.hr,
                        commands.title,
                        commands.divider,
                        commands.link,
                        commands.quote,
                        commands.code,
                        commands.divider,
                        commands.unorderedListCommand,
                        commands.orderedListCommand,
                        commands.checkedListCommand,
                        commands.divider,
                    ]}
                    extraCommands={[
                        commands.codeEdit,
                        commands.codeLive,
                        commands.codePreview,
                    ]}
                    preview="edit"
                    autoCorrect="true"
                    height={100}
                    style={{ whiteSpace: "pre-wrap" }}
                />
            </CardBody>
            <CardFooter>
                <Button variant="contained" color="primary" disabled={!(content.length > 0)} fullWidth sx={{ marginTop: "4px" }} onClick={handleSubmit}>{ parrent ? "Comment" : "Post" }</Button>
            </CardFooter>
        </Card>
    )
}