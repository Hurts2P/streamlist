function Movies() {
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Movies Page</h1>
      <p style={styles.text}>Coming in Week 4!</p>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    textAlign: 'center'
  },
  title: {
    color: '#e50914'
  },
  text: {
    color: '#666'
  }
};

export default Movies;