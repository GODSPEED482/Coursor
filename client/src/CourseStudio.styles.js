export const styles = {
    loaderInline: {
        animation: 'spin 2s linear infinite'
    },
    gatheringBlueprint: {
        color: 'var(--text-secondary)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    roadmapDayHeading: (isMain) => ({
        fontSize: '0.9rem',
        color: isMain ? 'var(--text-primary)' : 'var(--text-secondary)',
        marginBottom: '8px'
    }),
    roadmapItemIcon: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.85rem'
    },
    roadmapHeader: {
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    roadmapProgress: {
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        marginBottom: '16px'
    },
    roadmapComplete: {
        color: 'var(--success)',
        marginLeft: '8px'
    },
    roadmapPreReqContainer: {
        paddingBottom: '16px',
        borderBottom: '1px solid var(--border-color)',
        marginBottom: '16px'
    },
    roadmapPreReqTitle: {
        marginBottom: '12px',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'var(--warning)'
    },
    roadmapCurriculumTitle: {
        marginBottom: '12px',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: 'var(--accent-color)'
    },
    mainContentPlaceholder: {
        opacity: 0.5,
        textAlign: 'center',
        marginTop: '100px'
    },
    mainContentLoading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        flexDirection: 'column',
        gap: '16px',
        color: 'var(--text-secondary)'
    },
    mainTitle: {
        fontSize: '2rem',
        marginBottom: '8px'
    },
    mainIntro: {
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        fontSize: '1.1rem'
    },
    bulletContainer: {
        padding: '20px',
        marginBottom: '24px'
    },
    bulletTitle: {
        marginBottom: '12px',
        color: 'var(--accent-color)'
    },
    bulletPointers: {
        paddingLeft: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    tableContainer: {
        padding: '20px',
        marginBottom: '24px',
        overflowX: 'auto'
    },
    tableTitle: {
        marginBottom: '12px',
        color: 'var(--accent-color)'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        textAlign: 'left'
    },
    tableHeaderCell: {
        borderBottom: '1px solid var(--border-color)',
        padding: '8px'
    },
    tableBodyCell: {
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        padding: '8px'
    },
    videoContainer: {
        padding: '20px',
        marginBottom: '24px'
    },
    videoTitle: {
        marginBottom: '12px',
        color: 'var(--warning)'
    },
    videoIframeWrapper: {
        position: 'relative',
        paddingBottom: '56.25%',
        height: 0,
        overflow: 'hidden',
        maxWidth: '100%',
        marginBottom: '16px',
        borderRadius: '8px'
    },
    videoIframe: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        border: 'none'
    },
    videoFallback: {
        color: 'var(--text-secondary)',
        marginBottom: '8px'
    },
    videoLink: {
        color: 'var(--accent-color)'
    },
    conclusionContainer: {
        padding: '20px',
        marginTop: '24px'
    },
    conclusionTitle: {
        marginBottom: '12px',
        color: 'var(--success)'
    },
    copilotHeaderContainer: {
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '16px'
    },
    copilotScrollArea: {
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        flex: 1,
        overflowY: 'auto'
    },
    copilotTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    copilotAnalysing: {
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontStyle: 'italic'
    },
    copilotApproved: {
        color: 'var(--success)',
        fontSize: '0.9rem'
    },
    questionCard: {
        background: 'rgba(255,255,255,0.05)',
        padding: '12px',
        borderRadius: '8px'
    },
    questionText: {
        fontSize: '0.9rem',
        marginBottom: '8px',
        fontWeight: 600
    },
    questionInput: {
        fontSize: '0.85rem',
        padding: '8px'
    },
    submitBtnWrapper: {
        padding: '0 16px',
        marginTop: 'auto'
    },
    submitBtn: {
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    logFeedHeader: {
        padding: '16px 16px 8px',
        borderBottom: '1px solid rgba(255,255,255,0.05)'
    },
    logFeedTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '0.9rem'
    },
    logFeedBody: {
        flex: 1,
        padding: '8px',
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.2)'
    },
    logIdentifier: {
        marginLeft: '8px',
        opacity: 0.5
    }
};
