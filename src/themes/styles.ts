const styles = {
  global: {
    'html, body': {
      color: 'black.1',
      fontSize: {
        md: '16px',
        sm: '14px',
        xs: '14px',
      },
    },
    a: {
      color: 'blue.1',
    },
    '.banner-bg': {
      backgroundColor: 'red',
    },
    [`
      .custom-slider .slick-prev::before,
      .custom-slider .slick-next::before
    `]: {
      color: 'rgba(0, 0, 0, 0.2)',
    },
  },
}

export default styles
