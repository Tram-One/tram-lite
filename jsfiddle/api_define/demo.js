define`
  <my-greeting>
    <h1>Hello ${'name'}</h1>
  </my-greeting>
`;

const greeting = document.createElement('my-greeting');
greeting.setAttribute('name', 'Ada');
document.body.appendChild(greeting);

greeting.setAttribute('name', 'Nikola');
