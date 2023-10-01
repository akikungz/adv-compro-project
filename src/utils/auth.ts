export default {
    user_token: localStorage.getItem('user_token'),
    create_user_token: (token: string) => localStorage.setItem('user_token', token),
    delete_user_token: () => localStorage.removeItem('user_token'),

    user_name: localStorage.getItem('user_name'),
    create_user_name: (name: string) => localStorage.setItem('user_name', name),
    delete_user_name: () => localStorage.removeItem('user_name'),

    user_id: localStorage.getItem('user_id'),
    create_user_id: (id: string) => localStorage.setItem('user_id', id),
    delete_user_id: () => localStorage.removeItem('user_id'),
}