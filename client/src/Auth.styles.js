export const styles = {
    container: {
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #631f50 0%, #000000 100%)',
        animation: 'breathe 8s infinite alternate ease-in-out'
    },
    glassPanel: {
        width: '400px',
        padding: '40px',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    header: {
        textAlign: 'center'
    },
    title: {
        fontSize: '2rem',
        marginBottom: '8px',
        color: '#fff'
    },
    subtitle: {
        color: 'var(--text-secondary)'
    },
    errorBox: {
        color: '#ff4444',
        background: 'rgba(255,50,50,0.1)',
        padding: '12px',
        border: '1px solid rgba(255, 68, 68, 0.4)',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.9rem'
    },
    googleWrapper: {
        display: 'flex',
        justifyContent: 'center'
    },
    divider: {
        textAlign: 'center',
        color: 'var(--text-secondary)',
        fontSize: '0.85rem',
        margin: '8px 0'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
    },
    inputContainer: {
        padding: '8px 16px',
        borderRadius: '12px',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--border-color)'
    },
    input: {
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font-main)',
        fontSize: '1rem',
        padding: '8px 16px',
        borderRadius: '12px',
        width: '100%',
        transition: 'all 0.2s ease',
    },
    submitBtn: {
        marginTop: '8px',
        borderRadius: '12px',
        display: 'flex',
        justifyContent: 'center',
        gap: '8px'
    },
    switchAuthWrapper: {
        textAlign: 'center',
        marginTop: '8px'
    },
    switchAuthBtn: {
        background: 'none',
        border: 'none',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        fontSize: '0.9rem',
        textDecoration: 'underline'
    }
};
