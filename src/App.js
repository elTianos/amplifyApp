import React, { useState, useEffect } from 'react';
import { API } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import './App.css';

import { listTodos } from './graphql/queries';
import { createTodo as createTodoMutation, deleteTodo as deleteTodoMutation } from './graphql/mutations';

const initialFormState = { name: '', description: '' }

function App() {
  const [Todos, setTodos] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos (){
    const apiData = await API.graphql({query: listTodos});
    setTodos(apiData.data.listTodos.items);
  }

  async function createTodo(){
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createTodoMutation, variables: { input: formData } });
    setTodos([ ...Todos, formData]);
    setFormData(initialFormState);
  }

  async function deleteTodo ({ id }){
    const newTodosArray = Todos.filter(Todo => Todo.id !== id);
    setTodos(newTodosArray);
    await API.graphql({ query: deleteTodoMutation, variables: { input: { id }} });
  }

  return (
    <div className='App'>
      <Authenticator>
        {({ signOut, user }) => (
          <div>
            <h1>Hello {user.username}</h1>
            <button onClick={signOut}>Sign out</button>
          </div>
        )}
      </Authenticator>
      
      <h1>My Todo</h1>
      <div className='container'>
        <input 
          onChange={e => setFormData({ ...formData, 'name': e.target.value})}
          placeholder= "Name"
          value={formData.name}
        />
        <br/>
        <br/>
        <input
          onChange={e => setFormData({ ...formData, 'description': e.target.value})}
          placeholder="Description"
          value={formData.description}
        />
        <br/>
        <br/>        
        <button onClick={createTodo}>Create</button>
      </div>

      <div>
        {
          Todos.map(todo =>(
            <div key={todo.id || todo.name} className='nodo'>
              <h2>Name: {todo.name}</h2>
              <p>Description: {todo.description}</p>
              <button onClick={()=> deleteTodo(todo)}>Delete</button>
            </div>
          ))
        }
      </div>      
    </div>
  );
}

export default App;