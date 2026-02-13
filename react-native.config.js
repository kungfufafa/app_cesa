module.exports = {
  dependencies: {
    "@react-native-ml-kit/face-detection": {
      platforms: {
        ios: null, // Disable iOS auto-linking — MLKit has no arm64 simulator support
      },
    },
  },
};
