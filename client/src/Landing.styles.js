export const styles = {
    landingLayout: {
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--bg-color)',
        position: 'relative'
    },
    sidebar: (isOpen) => ({
        position: 'absolute',
        top: '5rem',
        left: '1rem',
        width: '320px',
        minHeight: 'calc(100vh - 7rem)',
        maxHeight: 'calc(100vh - 7rem)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        background: 'rgba(15, 18, 25, 0.4)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--border-color)',
        borderRadius: '24px',
        zIndex: 100,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isOpen ? 'translateX(0)' : 'translateX(-350px)',
        opacity: isOpen ? 1 : 0,
        visibility: isOpen ? 'visible' : 'hidden'
    }),
    toggleButton: (isOpen) => ({
        position: 'absolute',
        top: '6rem',
        left: isOpen ? '310px' : '1.5rem',
        zIndex: 110,
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        background: 'var(--surface-color)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        color: 'var(--text-primary)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
    }),
    sidebarHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '1.2rem'
    },
    sidebarTitle: {
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    },
    historyContainer: {
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        paddingRight: '6px'
    },
    historyItem: {
        padding: '12px 16px',
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid transparent',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    historyItemHover: {
        background: 'rgba(255, 255, 255, 0.07)',
        borderColor: 'rgba(189, 49, 142, 0.3)',
        transform: 'translateX(4px)'
    },
    courseTitle: {
        fontSize: '0.9rem',
        fontWeight: 500,
        color: 'var(--text-primary)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    courseDate: {
        fontSize: '0.7rem',
        color: 'var(--text-secondary)'
    },
    emptyState: {
        textAlign: 'center',
        padding: '30px 10px',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        opacity: 0.6
    },
    mainContent: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1
    }
};
