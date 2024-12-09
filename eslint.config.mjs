import antfu from '@antfu/eslint-config'

export default antfu({
  typescript: true,
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'warn',
  },
})
