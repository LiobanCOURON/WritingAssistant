import React, { useState } from 'react';
import { useApp } from '../contexts';
import { t } from '../i18n';
import { CharacterNote, PlaceNote, MomentNote, OverviewNote } from '../types';
import {
  X, BookOpen, Users, MapPin, Clock, Plus, Trash2,
  Edit3, Save, ChevronDown, ChevronRight, StickyNote
} from 'lucide-react';

type NotesTab = 'overview' | 'characters' | 'places' | 'moments';

export function NotesPanel() {
  const {
    language, notesOpen, setNotesOpen, activeProject,
    updateOverview, addCharacter, updateCharacter, deleteCharacter,
    addPlace, updatePlace, deletePlace,
    addMoment, updateMoment, deleteMoment,
  } = useApp();

  const [activeTab, setActiveTab] = useState<NotesTab>('overview');
  const [editingChar, setEditingChar] = useState<string | null>(null);
  const [editingPlace, setEditingPlace] = useState<string | null>(null);
  const [editingMoment, setEditingMoment] = useState<string | null>(null);

  if (!notesOpen || !activeProject) return null;

  const tabs: { id: NotesTab; label: string; icon: React.ReactNode; count: number }[] = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <BookOpen size={16} />, count: 1 },
    { id: 'characters', label: 'Personnages', icon: <Users size={16} />, count: activeProject.notes.characters.length },
    { id: 'places', label: 'Lieux', icon: <MapPin size={16} />, count: activeProject.notes.places.length },
    { id: 'moments', label: 'Moments', icon: <Clock size={16} />, count: activeProject.notes.moments.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 anim-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-30" onClick={() => setNotesOpen(false)} />
      <div className="glass w-full max-w-4xl max-h-[85vh] overflow-hidden relative z-40 anim-scale-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <StickyNote size={20} className="text-purple-400 anim-pulse" />
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent">
              {t('memory', language)} & Notes
            </h2>
            <span className="text-xs opacity-40 ml-2">{activeProject.name}</span>
          </div>
          <button onClick={() => setNotesOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-all hover-glow">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 px-4">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm transition-all border-b-2 -mb-px hover-glow ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent opacity-50 hover:opacity-80'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/10">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'overview' && (
            <OverviewEditor
              overview={activeProject.notes.overview}
              onSave={(updates) => updateOverview(activeProject.id, updates)}
              language={language}
            />
          )}
          {activeTab === 'characters' && (
            <CharactersEditor
              characters={activeProject.notes.characters}
              onAdd={(char) => addCharacter(activeProject.id, char)}
              onUpdate={(id, updates) => updateCharacter(activeProject.id, id, updates)}
              onDelete={(id) => deleteCharacter(activeProject.id, id)}
              language={language}
            />
          )}
          {activeTab === 'places' && (
            <PlacesEditor
              places={activeProject.notes.places}
              onAdd={(place) => addPlace(activeProject.id, place)}
              onUpdate={(id, updates) => updatePlace(activeProject.id, id, updates)}
              onDelete={(id) => deletePlace(activeProject.id, id)}
              language={language}
            />
          )}
          {activeTab === 'moments' && (
            <MomentsEditor
              moments={activeProject.notes.moments}
              characters={activeProject.notes.characters}
              places={activeProject.notes.places}
              onAdd={(moment) => addMoment(activeProject.id, moment)}
              onUpdate={(id, updates) => updateMoment(activeProject.id, id, updates)}
              onDelete={(id) => deleteMoment(activeProject.id, id)}
              language={language}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Overview Editor
function OverviewEditor({ overview, onSave, language }: { overview: OverviewNote; onSave: (u: Partial<OverviewNote>) => void; language: string }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(overview);

  const fields = [
    { key: 'premise', label: 'Prémisse / Idée centrale' },
    { key: 'genre', label: 'Genre' },
    { key: 'tone', label: 'Ton' },
    { key: 'setting', label: 'Cadre général' },
    { key: 'plotSummary', label: 'Résumé de l\'intrigue' },
    { key: 'worldRules', label: 'Règles du monde' },
    { key: 'audience', label: 'Public visé' },
    { key: 'goals', label: 'Objectifs du projet' },
  ];

  return (
    <div className="space-y-4 anim-fade-in">
      <div className="flex justify-end">
        {editing ? (
          <button
            onClick={() => { onSave(draft); setEditing(false); }}
            className="glass-button glass-button-primary flex items-center gap-2 text-sm anim-scale-hover hover-glow"
          >
            <Save size={14} /> Sauvegarder
          </button>
        ) : (
          <button
            onClick={() => { setDraft(overview); setEditing(true); }}
            className="glass-button flex items-center gap-2 text-sm anim-scale-hover hover-glow"
          >
            <Edit3 size={14} /> Modifier
          </button>
        )}
      </div>

      {fields.map(field => (
        <div key={field.key} className="glass-subtle p-3 anim-fade-in">
          <label className="text-xs font-medium opacity-60 mb-1 block">{field.label}</label>
          {editing ? (
            field.key === 'plotSummary' || field.key === 'worldRules' || field.key === 'goals' ? (
              <textarea
                value={(draft as any)[field.key]}
                onChange={e => setDraft({ ...draft, [field.key]: e.target.value })}
                className="glass-input w-full px-3 py-2 text-sm min-h-[80px] resize-y"
              />
            ) : (
              <input
                type="text"
                value={(draft as any)[field.key]}
                onChange={e => setDraft({ ...draft, [field.key]: e.target.value })}
                className="glass-input w-full px-3 py-2 text-sm"
              />
            )
          ) : (
            <p className="text-sm opacity-80">
              {(overview as any)[field.key] || <span className="opacity-30 italic">Non défini</span>}
            </p>
          )}
        </div>
      ))}

      {/* Themes */}
      <div className="glass-subtle p-3">
        <label className="text-xs font-medium opacity-60 mb-1 block">Thèmes</label>
        {editing ? (
          <input
            type="text"
            value={draft.themes.join(', ')}
            onChange={e => setDraft({ ...draft, themes: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
            placeholder="Séparés par des virgules"
            className="glass-input w-full px-3 py-2 text-sm"
          />
        ) : (
          <div className="flex flex-wrap gap-1">
            {overview.themes.map(theme => (
              <span key={theme} className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 anim-scale-in">
                {theme}
              </span>
            ))}
            {overview.themes.length === 0 && <span className="text-sm opacity-30 italic">Aucun thème défini</span>}
          </div>
        )}
      </div>
    </div>
  );
}

// Characters Editor
function CharactersEditor({ characters, onAdd, onUpdate, onDelete, language }: {
  characters: CharacterNote[];
  onAdd: (c: CharacterNote) => void;
  onUpdate: (id: string, u: Partial<CharacterNote>) => void;
  onDelete: (id: string) => void;
  language: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: newName.trim(),
      aliases: [],
      age: '',
      appearance: '',
      personality: '',
      background: '',
      goals: '',
      fears: '',
      relationships: '',
      conflicts: '',
      development: '',
      importantFacts: [],
    });
    setNewName('');
    setShowNew(false);
  };

  return (
    <div className="space-y-3 anim-fade-in">
      {characters.map((char, i) => (
        <div key={char.id} className="glass-subtle overflow-hidden anim-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <div
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-all"
            onClick={() => setExpanded(expanded === char.id ? null : char.id)}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white text-sm font-bold">
              {char.name[0]?.toUpperCase()}
            </div>
            <span className="flex-1 font-medium">{char.name}</span>
            {expanded === char.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(char.id); }}
              className="p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {expanded === char.id && (
            <div className="p-3 pt-0 space-y-2 anim-slide-down">
              {[
                { key: 'aliases', label: 'Alias', type: 'text' },
                { key: 'age', label: 'Âge', type: 'text' },
                { key: 'appearance', label: 'Apparence', type: 'textarea' },
                { key: 'personality', label: 'Personnalité', type: 'textarea' },
                { key: 'background', label: 'Background', type: 'textarea' },
                { key: 'goals', label: 'Objectifs & Motivations', type: 'textarea' },
                { key: 'fears', label: 'Peurs & Failles', type: 'textarea' },
                { key: 'relationships', label: 'Relations', type: 'textarea' },
                { key: 'conflicts', label: 'Conflits', type: 'textarea' },
                { key: 'development', label: 'Développement', type: 'textarea' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs opacity-50 mb-0.5 block">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={(char as any)[field.key]}
                      onChange={e => onUpdate(char.id, { [field.key]: e.target.value })}
                      className="glass-input w-full px-2 py-1.5 text-sm min-h-[60px] resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={field.key === 'aliases' ? (char as any)[field.key].join(', ') : (char as any)[field.key]}
                      onChange={e => {
                        if (field.key === 'aliases') {
                          onUpdate(char.id, { aliases: e.target.value.split(',').map(s => s.trim()).filter(Boolean) });
                        } else {
                          onUpdate(char.id, { [field.key]: e.target.value });
                        }
                      }}
                      className="glass-input w-full px-2 py-1.5 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {showNew ? (
        <div className="glass-subtle p-3 flex gap-2 anim-scale-in">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nom du personnage..."
            className="glass-input flex-1 px-3 py-2 text-sm"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="glass-button glass-button-primary text-sm px-4">
            <Plus size={16} />
          </button>
          <button onClick={() => setShowNew(false)} className="glass-button text-sm px-4">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full glass-button flex items-center justify-center gap-2 py-3 anim-scale-hover hover-glow"
        >
          <Plus size={16} />
          Ajouter un personnage
        </button>
      )}
    </div>
  );
}

// Places Editor
function PlacesEditor({ places, onAdd, onUpdate, onDelete, language }: {
  places: PlaceNote[];
  onAdd: (p: PlaceNote) => void;
  onUpdate: (id: string, u: Partial<PlaceNote>) => void;
  onDelete: (id: string) => void;
  language: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      name: newName.trim(),
      type: '',
      layout: '',
      landmarks: [],
      atmosphere: '',
      history: '',
      inhabitants: '',
      importantObjects: [],
      events: '',
      rules: '',
    });
    setNewName('');
    setShowNew(false);
  };

  return (
    <div className="space-y-3 anim-fade-in">
      {places.map((place, i) => (
        <div key={place.id} className="glass-subtle overflow-hidden anim-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <div
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-all"
            onClick={() => setExpanded(expanded === place.id ? null : place.id)}
          >
            <MapPin size={18} className="text-emerald-400" />
            <span className="flex-1 font-medium">{place.name}</span>
            {place.type && <span className="text-xs opacity-40 px-2 py-0.5 rounded-full bg-white/5">{place.type}</span>}
            {expanded === place.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(place.id); }}
              className="p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {expanded === place.id && (
            <div className="p-3 pt-0 space-y-2 anim-slide-down">
              {[
                { key: 'type', label: 'Type de lieu', type: 'text' },
                { key: 'layout', label: 'Disposition', type: 'textarea' },
                { key: 'atmosphere', label: 'Atmosphère', type: 'textarea' },
                { key: 'history', label: 'Histoire', type: 'textarea' },
                { key: 'inhabitants', label: 'Habitants', type: 'textarea' },
                { key: 'events', label: 'Événements importants', type: 'textarea' },
                { key: 'rules', label: 'Règles / Restrictions', type: 'textarea' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs opacity-50 mb-0.5 block">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={(place as any)[field.key]}
                      onChange={e => onUpdate(place.id, { [field.key]: e.target.value })}
                      className="glass-input w-full px-2 py-1.5 text-sm min-h-[60px] resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={(place as any)[field.key]}
                      onChange={e => onUpdate(place.id, { [field.key]: e.target.value })}
                      className="glass-input w-full px-2 py-1.5 text-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {showNew ? (
        <div className="glass-subtle p-3 flex gap-2 anim-scale-in">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Nom du lieu..."
            className="glass-input flex-1 px-3 py-2 text-sm"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="glass-button glass-button-primary text-sm px-4">
            <Plus size={16} />
          </button>
          <button onClick={() => setShowNew(false)} className="glass-button text-sm px-4">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full glass-button flex items-center justify-center gap-2 py-3 anim-scale-hover hover-glow"
        >
          <Plus size={16} />
          Ajouter un lieu
        </button>
      )}
    </div>
  );
}

// Moments Editor
function MomentsEditor({ moments, characters, places, onAdd, onUpdate, onDelete, language }: {
  moments: MomentNote[];
  characters: CharacterNote[];
  places: PlaceNote[];
  onAdd: (m: MomentNote) => void;
  onUpdate: (id: string, u: Partial<MomentNote>) => void;
  onDelete: (id: string) => void;
  language: string;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd({
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      description: '',
      type: 'event',
      timing: { relation: 'after' },
      duration: '',
      charactersInvolved: [],
      consequences: '',
      linkedMoments: [],
    });
    setNewTitle('');
    setShowNew(false);
  };

  const typeLabels: Record<string, string> = {
    event: 'Événement',
    decision: 'Décision',
    revelation: 'Révélation',
    conversation: 'Conversation',
    confrontation: 'Confrontation',
    turning_point: 'Point de bascule',
    flashback: 'Flashback',
    relationship_change: 'Changement de relation',
  };

  return (
    <div className="space-y-3 anim-fade-in">
      {moments.map((moment, i) => (
        <div key={moment.id} className="glass-subtle overflow-hidden anim-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
          <div
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/5 transition-all"
            onClick={() => setExpanded(expanded === moment.id ? null : moment.id)}
          >
            <Clock size={18} className="text-amber-400" />
            <span className="flex-1 font-medium">{moment.title}</span>
            <span className="text-xs opacity-40 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
              {typeLabels[moment.type] || moment.type}
            </span>
            {expanded === moment.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(moment.id); }}
              className="p-1 rounded hover:bg-red-500/20 text-red-400 opacity-0 hover:opacity-100 transition-all"
            >
              <Trash2 size={14} />
            </button>
          </div>

          {expanded === moment.id && (
            <div className="p-3 pt-0 space-y-2 anim-slide-down">
              <div>
                <label className="text-xs opacity-50 mb-0.5 block">Description</label>
                <textarea
                  value={moment.description}
                  onChange={e => onUpdate(moment.id, { description: e.target.value })}
                  className="glass-input w-full px-2 py-1.5 text-sm min-h-[80px] resize-y"
                />
              </div>
              <div>
                <label className="text-xs opacity-50 mb-0.5 block">Type</label>
                <select
                  value={moment.type}
                  onChange={e => onUpdate(moment.id, { type: e.target.value as any })}
                  className="glass-select w-full px-2 py-1.5 text-sm"
                >
                  {Object.entries(typeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs opacity-50 mb-0.5 block">Durée</label>
                <input
                  type="text"
                  value={moment.duration || ''}
                  onChange={e => onUpdate(moment.id, { duration: e.target.value })}
                  placeholder="ex: 10 minutes, 3 jours..."
                  className="glass-input w-full px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="text-xs opacity-50 mb-0.5 block">Conséquences</label>
                <textarea
                  value={moment.consequences}
                  onChange={e => onUpdate(moment.id, { consequences: e.target.value })}
                  className="glass-input w-full px-2 py-1.5 text-sm min-h-[60px] resize-y"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {showNew ? (
        <div className="glass-subtle p-3 flex gap-2 anim-scale-in">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Titre du moment..."
            className="glass-input flex-1 px-3 py-2 text-sm"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} className="glass-button glass-button-primary text-sm px-4">
            <Plus size={16} />
          </button>
          <button onClick={() => setShowNew(false)} className="glass-button text-sm px-4">
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowNew(true)}
          className="w-full glass-button flex items-center justify-center gap-2 py-3 anim-scale-hover hover-glow"
        >
          <Plus size={16} />
          Ajouter un moment
        </button>
      )}
    </div>
  );
}
