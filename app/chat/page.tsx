import dynamic from 'next/dynamic'
const ChatPageClient = dynamic(() => import('./ChatPageClient'), { ssr: false })
return <ChatPageClient />
