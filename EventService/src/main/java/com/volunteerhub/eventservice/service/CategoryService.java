package com.volunteerhub.eventservice.service;

import com.volunteerhub.eventservice.model.Category;
import com.volunteerhub.eventservice.repository.CategoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
@AllArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public Category findByID(Long id) {
        return categoryRepository.findById(id).orElseThrow(() ->
                new NoSuchElementException("No such category with id " + id));
    }

    public Category findByNameOrCreate(String name) {
        return categoryRepository.findByName(name)
                .orElseGet(() -> {
            Category newCategory = new Category();
            newCategory.setName(name);
            return categoryRepository.save(newCategory);
        });
    }
}
