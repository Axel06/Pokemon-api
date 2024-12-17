import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // Barre de recherche
  const [selectedPokemon, setSelectedPokemon] = useState(null); // État pour le Pokémon sélectionné

  useEffect(() => {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=500')
      .then((res) => res.json())
      .then(async (data) => {
        const results = data.results;

        const pokemonsData = await Promise.all(
          results.map(async (pokemon) => {
            const id = pokemon.url.split('/').filter(Boolean).pop();

            // Fetch des infos détaillées
            const resPokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            const pokemonData = await resPokemon.json();

            // Fetch des noms en français
            const resSpecies = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
            const speciesData = await resSpecies.json();

            // Cherche le nom en français
            const frenchNameEntry = speciesData.names.find((n) => n.language.name === 'fr');
            const frenchName = frenchNameEntry ? frenchNameEntry.name : pokemonData.name;

            return {
              id: pokemonData.id,
              name: frenchName, // Nom en français
              sprites: pokemonData.sprites,
              types: pokemonData.types,
              height: pokemonData.height,
              weight: pokemonData.weight,
              stats: pokemonData.stats,
              abilities: pokemonData.abilities,
            };
          })
        );

        setPokemons(pokemonsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleClose = () => {
    setSelectedPokemon(null);
  };

  // Filtrage avec la barre de recherche
  const filteredPokemons = pokemons.filter((poke) =>
    poke.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Chargement en cours...</div>;
  }

  return (
    <div className="App">
      {/* Logo Pokémon */}
      <img 
        src="/logopoke.svg" 
        alt="Logo Pokémon" 
        className="pokemon-logo" 
      />

      {/* Barre de recherche */}
      <input
        type="text"
        placeholder="Rechercher un Pokémon..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
      />

      {/* Liste des Pokémon */}
      <div className="pokemon-container">
        {filteredPokemons.map((poke) => (
          <PokemonCard key={poke.id} pokemon={poke} onCardClick={handleCardClick} />
        ))}
      </div>

      {/* Modal pour afficher les détails */}
      {selectedPokemon && (
        <PokemonDetails pokemon={selectedPokemon} onClose={handleClose} />
      )}
    </div>
  );
}

function PokemonCard({ pokemon, onCardClick }) {
  return (
    <div
      className="pokemon-card"
      style={{ backgroundColor: getColorFromType(pokemon.types[0].type.name) }}
      onClick={() => onCardClick(pokemon)}
    >
      <h3>{pokemon.name.toUpperCase()}</h3>
      <img src={pokemon.sprites.front_default} alt={pokemon.name} />
    </div>
  );
}

function PokemonDetails({ pokemon, onClose }) {
  return (
    <div className="pokemon-details-overlay">
      <div className="pokemon-details">
        <button onClick={onClose} className="close-button">X</button>
        <h2>{pokemon.name.toUpperCase()}</h2>
        <img 
          src={pokemon.sprites?.front_default || "/placeholder.png"} 
          alt={pokemon.name} 
        />

        {/* Caractéristiques */}
        <p><strong>Taille :</strong> {pokemon.height ? pokemon.height / 10 : "N/A"} m</p>
        <p><strong>Poids :</strong> {pokemon.weight ? pokemon.weight / 10 : "N/A"} kg</p>

        {/* Barres de stats */}
        <div>
          <strong>Stats :</strong>
          {pokemon.stats && pokemon.stats.length > 0 ? (
            pokemon.stats.map((stat) => (
              <div key={stat.stat.name} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{stat.stat.name.toUpperCase()}</span>
                  <span>{stat.base_stat}</span>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '10px',
                    backgroundColor: '#ddd',
                    borderRadius: '5px',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(stat.base_stat, 100)}%`,
                      height: '100%',
                      backgroundColor: '#ffcb05',
                    }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p>Aucune statistique disponible.</p>
          )}
        </div>

        {/* Capacités */}
        <div style={{ marginTop: '1rem' }}>
          <strong>Capacités :</strong>
          {pokemon.abilities && pokemon.abilities.length > 0 ? (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {pokemon.abilities.map((ability) => (
                <li key={ability.ability.name}>{ability.ability.name}</li>
              ))}
            </ul>
          ) : (
            <p>Aucune capacité disponible.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function getColorFromType(type) {
  switch (type) {
    case 'grass':
      return 'green';
    case 'fire':
      return 'orange';
    case 'water':
      return '#329af0';
    case 'bug':
      return 'darkolivegreen';
    case 'normal':
      return 'grey';
    case 'electric':
      return 'goldenrod';
    default:
      return 'steelblue';
  }
}

export default App;
