/* eslint-disable no-undef */
import { showAlert } from './alerts';

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: '/api/v1/users/logout',
    });
    if (res.data.status === 'success') location.reload(true);
  } catch (error) {
    console.log('Error while logout', error);
    showAlert('error', 'Error logging out! Try again.');
  }
};
