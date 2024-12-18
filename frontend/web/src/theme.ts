import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: '#0B0E11',
        color: 'white',
      },
    },
  },
  components: {
    Input: {
      variants: {
        filled: {
          field: {
            bg: 'whiteAlpha.50',
            _hover: {
              bg: 'whiteAlpha.100',
            },
            _focus: {
              bg: 'whiteAlpha.100',
              borderColor: 'blue.300',
            },
          },
        },
      },
      defaultProps: {
        variant: 'filled',
      },
    },
    Button: {
      variants: {
        solid: {
          bg: '#5AA9E6',
          color: 'white',
          _hover: {
            bg: '#4A99D6',
          },
        },
      },
    },
    Checkbox: {
      baseStyle: {
        control: {
          _checked: {
            bg: '#5AA9E6',
            borderColor: '#5AA9E6',
          },
        },
      },
    },
  },
});

export default theme;
