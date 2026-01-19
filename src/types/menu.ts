export type MenuItem = {
    title: string
    path?: string
    element?: React.ReactNode
    children?: MenuItem[]
}