import { FC, useState, useEffect } from "react";
import "../App.css";
import { listNotes } from "../graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  updateNote as updateNoteMutation,
} from "../graphql/mutations";
import { API } from "aws-amplify";

interface INote {
  id: string;
  name: string;
  description: string;
}

const initialFormState = {
  id: "",
  name: "",
  description: "",
};

const Notes: FC = () => {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const apiData: any = await API.graphql({ query: listNotes });
    setNotes(apiData.data.listNotes.items);
  };

  const createNote = async () => {
    if (!formData.name || !formData.description) return;
    await API.graphql({
      query: createNoteMutation,
      variables: { input: formData },
    });
    setFormData(initialFormState);
    fetchNotes();
  };

  const loadNoteToUpdate = async (note: INote) => {
    console.log("note", note);
    setFormData(note);
  };

  const updateNote = async () => {
    await API.graphql({
      query: updateNoteMutation,
      variables: {
        input: {
          id: formData.id,
          name: formData.name,
          description: formData.description,
        },
      },
    });
    setFormData(initialFormState);
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    const newNotesArray = notes.filter((note: INote) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  };

  return (
    <div>
      <h1>My Notes API!</h1>
      <input
        type="text"
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        type="text"
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        placeholder="Note description"
        value={formData.description}
      />
      <button onClick={createNote}>Create Note</button>
      <button onClick={updateNote}>Update Note</button>
      <div style={{ marginBottom: 30 }}>
        {notes.map((note: INote) => (
          <div key={note.id || note.name}>
            <h2>{note.name}</h2>
            <p>{note.description}</p>
            <button onClick={() => deleteNote(note.id)}>Delete note</button>
            <button onClick={() => loadNoteToUpdate(note)}>Edit note</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
