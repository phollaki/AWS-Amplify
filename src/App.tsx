import { useEffect, useState } from 'react';
import styled from 'styled-components';
import AddTodo from './components/AddTodo';
import ListTodos from './components/ListTodos';
import UpdateTodo from './components/UpdateTodo';
import { Todo } from './API';
import { Toaster } from 'react-hot-toast';

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 50px;
  margin: 0 50px;
`;

const App = () => {
  const [selectedTodo, setSelectedTodo] = useState<undefined | Todo>(undefined);

  return (
    <AppContainer>
      <Toaster
        position="bottom-left"
      />
      <ListTodos setSelectedTodo={setSelectedTodo} />
      <AddTodo />
      {selectedTodo && <UpdateTodo todo={selectedTodo} />}
    </AppContainer>
  );
};

export default App;
