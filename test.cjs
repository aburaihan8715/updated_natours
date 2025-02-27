const x = 'find something';
const y = 'findOneAnd something';

const myFunc = () => {
  const regex = /^find/; // Regular expression to match the start

  if (regex.test(x)) {
    console.log('starts with find');
  }
  if (regex.test(y)) {
    console.log('starts with findOneAnd');
  }
};

myFunc();
