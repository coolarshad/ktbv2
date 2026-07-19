import React from 'react';

const Loading = ({ message = 'Loading data...' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.spinner}></div>
        <p style={styles.text}>{message}</p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '80vh',
    width: '100%',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.75)',
    backdropFilter: 'blur(12px)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(99, 102, 241, 0.1)',
    borderTop: '4px solid #4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    marginTop: '1.25rem',
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#4f46e5',
    fontFamily: 'inherit',
    letterSpacing: '0.025em',
  },
};

// Inject CSS for the spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default Loading;
