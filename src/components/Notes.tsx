import { FC, useState, useEffect, ChangeEvent } from "react";
import "../App.css";
import { listNotes } from "../graphql/queries";
import {
  createNote as createNoteMutation,
  deleteNote as deleteNoteMutation,
  updateNote as updateNoteMutation,
} from "../graphql/mutations";
import { API, Storage } from "aws-amplify";

// interface INote {
//   id: string;
//   name: string;
//   description: string;
//   image: string;
// }

const initialFormState = {
  id: null,
  name: "",
  description: "",
  image: "",
};

const Notes: FC = () => {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    const apiData: any = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(
      notesFromAPI.map(async (note: any) => {
        if (note.image) {
          const image = await Storage.get(note.image);
          note.image = image;
        }
        return note;
      })
    );
    setNotes(apiData.data.listNotes.items);
  };

  const createNote = async () => {
    if (!formData.name || !formData.description) return;
    await API.graphql({ query: createNoteMutation, variables: { input: formData } });
    if (formData.image) {
      const image = await Storage.get(formData.image);
      formData.image = image;
    }
    setFormData(initialFormState);
    fetchNotes();
  };

  const loadNoteToUpdate = async (note: any) => {
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
          image: formData.image,
        },
      },
    });
    setFormData(initialFormState);
    fetchNotes();
  };

  const deleteNote = async (id: string) => {
    const newNotesArray = notes.filter((note: any) => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({
      query: deleteNoteMutation,
      variables: { input: { id } },
    });
  };

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    console.log("image", e);
    if (!e) return;
    if (e && e.target && e.target.files) {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file.name });
      const returnImage = await Storage.put(file.name, file);
      console.log("return image", returnImage);
      fetchNotes();
    }
  }

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

      <input type="file" onChange={onChange} />

      <button onClick={createNote}>Create Note</button>
      <button onClick={updateNote}>Update Note</button>
      <div style={{ marginBottom: 30 }}>
        {notes.map((note: any) => (
          <div key={note.id || note.name}>
            <h2>{note.name}</h2>
            <p>{note.description}</p>
            {note.image && <img src={note.image} alt="description" style={{ width: 400 }} />}
            <button onClick={() => deleteNote(note.id)}>Delete note</button>
            <button onClick={() => loadNoteToUpdate(note)}>Edit note</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes;
