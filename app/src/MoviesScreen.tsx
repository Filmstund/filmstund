import gql from "graphql-tag";
import * as React from "react";
import { FlatList, Image, Text, View } from "react-native";
import { NavigationInjectedProps } from "react-navigation";
import { useQuery } from "urql";
import { AllMoviesQuery } from "./__generated__/AllMoviesQuery";
import { EmptyList } from "./EmptyList";
import { padding } from "./style";

export const useAllMoviesQuery = () =>
  useQuery<AllMoviesQuery>({
    query: gql`
      query AllMoviesQuery {
        allMovies {
          ...MovieListMovie
        }
      }

      fragment MovieListMovie on Movie {
        id
        poster
        title
        releaseDate
        runtime
        imdbId
      }
    `
  });

const moviePoster =
  "https://catalog.cinema-api.com/images/ncg-images/e1cf3dd601ec4f23b4231f901f7b3c29.jpg?version=11D63C967B3576D4D5DBDE2A3ACFA3AB&width=240";

export const MoviesScreen: React.FC<NavigationInjectedProps> = ({
  navigation
}) => {
  const [{ data, fetching, error }, executeQuery] = useAllMoviesQuery();

  const movies = data ? data.allMovies : [];

  return (
    <FlatList
      data={movies}
      refreshing={fetching}
      onRefresh={executeQuery}
      keyExtractor={item => item.id}
      ListEmptyComponent={!fetching && <EmptyList text={"Inga filmer"} />}
      renderItem={({ item: movie }) => (
        <View
          key={movie.id}
          style={{ flexDirection: "row", backgroundColor: "white" }}
        >
          <Image
            source={{
              uri: movie.poster || moviePoster,
              height: 199,
              width: 134
            }}
          />
          <View style={{ padding, flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: "500" }}>
              {movie.title}
            </Text>
          </View>
        </View>
      )}
    />
  );
};
