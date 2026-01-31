import { EmailSidebar } from './components/EmailSidebar'

export default function EmailLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen bg-stone-50">
            <EmailSidebar />
            <main className="flex-1">
                {children}
            </main>
        </div>
    )
}
