import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  email: Yup.string().email('email').required('required'),
  password: Yup.string().required('required'),
});

export const signUpSchema = Yup.object().shape({
  name: Yup.string().required('required').min(3, 'minimum-length.3'),
  email: Yup.string().email('email').required('required'),
  password: Yup.string().required('required').min(6, 'minimum-length.9'),
  re_password: Yup.string().required('required').min(6, 'minimum-length.9'),
});
