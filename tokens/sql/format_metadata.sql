-- Format Data
SELECT json_object(
    'id', id,
    'name', name,
    'description', description,
    'image', image,
    'attributes', json_group_array(
        json_object(
            'trait_type', trait_type,
            'value', value
        )
    )
)
FROM easel_artists_80001_3927 JOIN easel_artist_attributes_80001_3928
ON easel_artists_80001_3927.id = easel_artist_attributes_80001_3928.artist_id
WHERE id = 1
GROUP BY id



-- Format Data
SELECT json_object(
    'id', a.id,
    'name', a.name,
    'description', a.description,
    'image', a.image,
    'attributes', json_group_array(
        json_object(
            'trait_type', attr.trait_type,
            'value', attr.value
        )
    ),
    'art', json_object(
        'artist', json_object(
            'external_id', a.external_id,
            'profile', a.profile,
            'portfolio', a.portfolio,
            'gallery', a.gallery
        ),
        'artwork', json_object(
            'external_id', aw.external_id,
            'name', aw.name,
            'url', aw.url
        ),
        'edition', json_object(
            'external_id', e.external_id,
            'number', e.number,
            'total', e.total,
            'artifact_source', e.artifact_source,
            'artifact_id', e.artifact_id,
            'url', e.url
        ),
        'patron', json_object(
            'external_id', p.external_id,
            'name', p.name,
            'url', p.url
        )
    )
)
FROM easel_artists_80001_3927 a
JOIN easel_artist_attributes_80001_3928 attr ON a.id = attr.artist_id
JOIN easel_artworks_80001_3929 aw ON aw.artist_id = a.id
JOIN easel_editions_80001_3975 e ON e.artwork_id = aw.id
JOIN easel_patrons_80001_3932 p ON e.patron_id = p.id
WHERE a.id = 1
AND aw.id = 1
AND e.id = 1
GROUP BY a.id